import React from 'react';
import '../styles/Service.css';

const Service = () => {
    // Replace with state later to give actual answer
    let answer = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius sit amet risus a viverra. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In a ultricies est. Nulla interdum tincidunt venenatis. Suspendisse a lectus sed odio sodales molestie. Etiam vitae leo neque. Curabitur vitae ligula eget felis mattis molestie. Donec tincidunt, nulla at consectetur aliquet, lectus dui bibendum orci, sit amet congue ante lectus sit amet tellus."
    return (
        <div classname="container">
            <div>
                <h1>GPT Textbook</h1>
                <p>Select your textbook and type your prompt below</p>
            </div>
            <br />
            <div className="question">
                <form>
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
            <div className="answer">
                <p>{answer}</p>
            </div>
        </div>
    )
}

export default Service;