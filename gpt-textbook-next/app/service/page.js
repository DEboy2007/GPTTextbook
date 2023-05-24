"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import GoogleButton from 'react-google-button'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const Service = () => {
    const [answer, setAnswer] = useState("Answer appears here!");
    const [question, setQuestion] = useState("No answer yet...");
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [button, setButton] = useState(false);
    const [user, setUser] = useState(null);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const handleSignInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // User is signed in
                const user = result.user;
                setUser(user);
                setUid(user.uid);

                // Add the user to the database with their UID
                addUserToDatabase();
            })
            .catch((error) => {
                // Handle sign-in errors
                console.error(error);
            });
    };

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                setUser(null);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    async function addUserToDatabase() {
        try {
            const docRef = doc(db, "users", String(uid));
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Returning user");
                return;
            }
            await setDoc(docRef, {
                tokens: 1000,
              }, { merge: true });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };


    async function writeData(data) {
        try {
            const docRef = await addDoc(collection(db, "requests"), {
                prompt: question,
                time: serverTimestamp(),
                tokens: model === "gpt-3.5-turbo" ? data["usage"]["total_tokens"] : data["usage"]["total_tokens"] * 2,
                uid: uid,
                model: model,
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    async function handleGPTRequest() {
        console.log("Calling OpenAI API");
        setAnswer("Loading...")
        try {
            await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPENAI_KEY
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [{ "role": "assistant", "content": question }]
                })
            }).then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
                setAnswer(data["choices"][0]["message"].content);
                writeData(data);
                setButton(false);
            });
        } catch (error) {
            console.log(error);
            setAnswer("Unfortunately, the API encountered an error. We apologize for the inconvenience, please try again!")
            setButton(false);
        }
    }

    async function handleCustomGPTRequest() {
        console.log("Calling " + model);
        setAnswer("Loading...");
        try {
            await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPENAI_KEY
                },
                body: JSON.stringify({
                    "model": model,
                    "prompt": question,
                    "max_tokens": 1000,
                    "temperature": 0.7,
                    "top_p": 1,
                    "frequency_penalty": 0,
                    "presence_penalty": 0.3,
                    "stop": ["\n"],
                })
            }).then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
                setAnswer(data["choices"][0]["text"]);
            }).then(data => {
                setQuestion("I have a finetuned model which is supposed to return answers from a textbook it is trained on. It was asked this question: " + question + ". The finetuned model gave this answer: " + answer + ". Use your general knowledge about the topic to make the finetuned model's answer more coherent and accurate, essentially filtering its weird artifacts or unrelated information while preserving its original information the best you can.")
                handleGPTRequest();
            });
        } catch (error) {
            console.log(error);
            setAnswer("Unfortunately, the API encountered an error. We apologize for the inconvenience, please try again!")
            setButton(false);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setButton(true);
        if (model === "gpt-3.5-turbo") {
            handleGPTRequest();
        } else {
            handleCustomGPTRequest();
        }
    }

    const handleTextboxChange = (event) => {
        setQuestion(event.target.value);
    }

    const handleModelChange = (event) => {
        setModel(event.target.value);
    }

    const formRef = React.createRef();
    return (
        user ? (
            <>
                <div className={styles.container}>
                    <div>
                        <h1>GPT Textbook</h1>
                        <p>Select your textbook and type your prompt below</p>
                    </div>
                    <br />
                    <div className={styles.question}>
                        <form ref={formRef} onSubmit={handleSubmit}>
                            <select name="textbook" id="textbook" onChange={handleModelChange}>
                                <option value="gpt-3.5-turbo">Base ChatGPT model</option>
                                <option value="curie:ft-personal-2023-05-19-18-07-57">AP European History</option>
                            </select>
                            <br />
                            <textarea name="question" id="question" placeholder="Question" onChange={handleTextboxChange}>
                            </textarea>
                            <br />
                            <input className={styles.submit} type="submit" value="Ask" disabled={button} />
                        </form>
                    </div>
                    <br />
                    <div>
                        <textarea value={answer} readOnly={true} className={styles.answer} />
                    </div>
                </div>
                <GoogleButton
                    label="Sign Out"
                    className={styles.GoogleButton}
                    onClick={handleSignOut}
                />
            </>
        ) : (
            <div className={styles.container}>
                <div>
                    <h1>Welcome to GPTTextbook</h1>
                    <p>The convenience of ChatGPT with the accuracy of a textbook!</p>
                </div>
                <GoogleButton
                    className={styles.GoogleButton}
                    onClick={handleSignInWithGoogle}
                />
            </div>
        )
    )
}

export default Service;