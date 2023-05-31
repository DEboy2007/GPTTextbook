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
    const [tokens, setTokens] = useState(0);

    // Fetch tokens available from Firebase
    const fetchTokens = async () => {
        try {
        const docRef = doc(db, "users", String(uid));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            setTokens(docSnap.data().tokens);
        } else {
            console.log("No such document!");
            setTokens(0);
        }
        } catch (e) {
        console.error("Error getting document: ", e);
        setTokens(0);
        }
    };

    // Run the fetchTokens function initially and every 10 seconds
    useEffect(() => {
        fetchTokens(); // Fetch tokens initially

        const interval = setInterval(fetchTokens, 5000); // Fetch tokens every 10 seconds

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, [uid]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setUid(user.uid);
                console.log(user.uid);
                addUserToDatabase(user.uid);
            } else {
                setUser(null);
                setUid(null);
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    const handleSignInWithGoogle = async (event) => {
        event.preventDefault();
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider)
          .then((result) => {
            // User is signed in
            const user = result.user;
            console.log(user.uid);
          })
          .catch((error) => {
            // Handle sign-in errors
            console.error(error);
          });
      };
      
    
    // Handle sign out function
    const handleSignOut = async() => {
        await signOut(auth)
            .then(() => {
                // Sign-out successful
                console.log("Sign-out successful");
                setUser(null);
                setUid(null);
            })
            .catch((error) => {
                // An error occurred
                console.error(error);
            });
    };
    
    async function addUserToDatabase(uid) { // Receive uid as an argument
        try {
            const docRef = doc(db, "users", String(uid));
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                console.log("Returning user");
                return uid;
            }
            await setDoc(docRef, {
                tokens: 10000,
            }, { merge: true });
            console.log("Document written with ID: ", docRef.id);
            return uid;
        } catch (e) {
            console.error("Error adding document: ", e);
            return null;
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
        console.log(tokens);
        if (tokens >= 1000) {
            if (model === "gpt-3.5-turbo") {
                handleGPTRequest();
            } else {
                handleCustomGPTRequest();
            }
        } else {
            setAnswer("Not enough tokens to make request!");
            setButton(false);
            return;
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
                        <p><b>Tokens available: {tokens}.</b> You need at least 1000 tokens to make a request.</p>
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