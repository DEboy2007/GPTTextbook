import React from 'react';
import '../styles/Service.css';
import { useState } from 'react';

const Service = () => {
    const api_key = import.meta.env.VITE_OPENAI_KEY;

    const [answer, setAnswer] = useState("");
    const [question, setQuestion] = useState("No answer yet...");

    async function handleGPTRequest() {
        console.log("Calling OpenAI API");
        try {
            await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + api_key
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [{ "role": "assistant", "content": question }]
                })
            }).then(response => {
                return response.json(import.meta.env.REACT_APP_OPENAI_KEY);
            }).then(data => {
                console.log(data);
                setAnswer(data["choices"][0]["message"].content);
            });
        } catch (error) {
            console.log(error);
            setAnswer("Unfortunately, the API encountered an error. We apologize for the inconvenience, please try again!")
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleGPTRequest();
    }

    const handleTextboxChange = (event) => {
        setQuestion(event.target.value);
    }

    const formRef = React.createRef();

    return (
        <>
            <div className="container">
                <div>
                    <h1>GPT Textbook</h1>
                    <p>Select your textbook and type your prompt below</p>
                </div>
                <br />
                <div className="question">
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <select name="textbook" id="textbook">
                            <option value="select">Textbook</option>
                            <option value="euro">AP European History</option>
                        </select>
                        <br />
                        <textarea name="question" id="question" placeholder="Question" onChange={handleTextboxChange}>
                        </textarea>
                        <br />
                        <input className="submit" type="submit" value="Ask" />
                    </form>
                </div>
                <br />
                <div>
                    <textarea value={answer} readOnly={true} className='answer' />
                </div>
            </div>
        </>
    )
}

export default Service;