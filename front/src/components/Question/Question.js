import {useState, useEffect} from "react";
import axios from "axios";
import {Container} from "react-bootstrap";
import CheckQuestion from "./CheckQuestion";

export default function Question(props) {
    const [questions, setQuestions] = useState([]);
    const tab = [];
    const nbQuestion = [];
    const answerPoint = [];

    async function getQuestion() {
        let data = [];
        let id = props.id;

        try {
            data = (await axios.get("/quiz/" + id)).data;
        } catch (err) {
            alert(err);
        } finally {
            setQuestions(data);
        }
    }

    const totalPoints = questions.reduce((acc, item) => {
        return acc + item.nb_points;
    }, 0);

    function calculatePoints() {
        let displayQuiz = document.getElementById('display-quiz');
        let result = document.getElementById('result');
        let point = 0;

        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= nbQuestion[i - 1]; j++) {
                let param = document.getElementById("answer_" + j + "_" + i)

                if (param.checked && param.value === tab[i - 1]) {
                    point += answerPoint[i - 1];
                }
            }
        }

        displayQuiz.style.display = 'none';
        result.innerHTML = `Vous avez obtenu ${point} points sur un total de ${totalPoints} points !`;
    }

    useEffect(() => {
        getQuestion();
    }, []);

    return (
        <>
            <Container id="display-quiz" style={{textAlign: 'center'}}>
                {questions.map((question, index) =>
                    <Container key={index} style={{marginTop: '5%'}}>
                        <h3 style={{textDecoration: 'underline'}}>Question {index + 1}
                            <div style={{display: "none"}}>{tab[index] = question.correct_answer}</div>
                            <div style={{display: "none"}}> {answerPoint[index] = question.nb_points}</div>
                            <span className="font-weight-bold"> ({question.nb_points} points)</span>
                        </h3>
                        <br/>
                        <h4>{question.sentence}</h4>
                        <br/>

                        <CheckQuestion question={question} index={index} nbQuestion={nbQuestion}/>
                    </Container>
                )}


                <button
                    className="btn btn-primary mt-5"
                    onClick={calculatePoints}
                >
                    Vérifier les réponses
                </button>
            </Container>

            <h2 id="result" className="col d-flex justify-content-center"/>
        </>
    );
}


