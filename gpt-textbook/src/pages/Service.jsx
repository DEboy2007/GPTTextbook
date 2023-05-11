import React from 'react';
import '../styles/Service.css';
import { useState } from 'react';

const Service = () => {
    // Replace with state later to give actual answer
    const [answer, setAnswer] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius sit amet risus a viverra. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In a ultricies est. Nulla interdum tincidunt venenatis. Suspendisse a lectus sed odio sodales molestie. Etiam vitae leo neque. Curabitur vitae ligula eget felis mattis molestie. Donec tincidunt, nulla at consectetur aliquet, lectus dui bibendum orci, sit amet congue ante lectus sit amet tellus.");

    const handleSubmit = (event) => {
        event.preventDefault();
        const textbook = event.target.elements.textbook.value;
        setAnswer(textbook);
        console.log(textbook);
    }

    const formRef = React.createRef();

    return (
        <div classname="container">
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
                    <br /> <br />
                    <textarea placeholder="Question">
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
    )
}

export default Service;