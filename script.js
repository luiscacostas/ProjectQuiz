let quiz = document.querySelector('.quiz');
let options = [];
let results = [];
let index = 0;
let respuestas = [];
let fecha = new Date().toDateString();
let btnHome = document.querySelector('#btnContenedor');
const btnLogin = document.querySelector('#login');
const btnRegister = document.querySelector('#registro');
const score = {
    date: fecha,
    points: 0
};
let scores = [];
let timeLeft = 10;
let timer;


document.addEventListener('DOMContentLoaded', () => {
    if (btnHome) {
        btnHome.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (ev.target.tagName === 'BUTTON') {
                const valueOption = ev.target.value;
                validateInicio(valueOption);
            }
        });
    }

    if (quiz) {
        quiz.addEventListener('click', (ev) => {
            ev.preventDefault();

            if (ev.target.tagName === 'BUTTON') {
                const valueOption = ev.target.value;
                validateResponse(valueOption, ev.target);
            }
            if (ev.target.id === 'siguiente') {
                index++;
                printQuiz(results, index);
                startTimer()
            }
        });
        getData();
    }
});

const getData = async () => {
    try {
        const resp = await fetch('https://opentdb.com/api.php?amount=10');
        if (resp.ok) {
            const data = await resp.json();
            results = data.results;
            console.log(results);
            printQuiz(results, index);
        } else {
            throw new Error('Error al obtener los datos');
        }
    } catch (error) {
        console.error(error);
    }
};

const printQuiz = (results, i) => {
    if (index === 10) {
        printResults(respuestas);
        return;
    }

    quiz.innerHTML = '';
    options = [...results[i].incorrect_answers, results[i].correct_answer];
    const pregunta = document.createElement('H3');
    pregunta.classList.add('styleParrafoPregunta')
    pregunta.textContent = results[i].question;
    quiz.append(pregunta);

    options.forEach((opc, index) => {
        const buttonOption = document.createElement('BUTTON');
        buttonOption.textContent = opc;
        buttonOption.setAttribute('id', `option${index + 1}`);
        buttonOption.classList.add('btn_option_style');
        buttonOption.classList.add(`option${index + 1}`);
        buttonOption.value = opc;
        quiz.append(buttonOption);
    });

    const buttonNext = document.createElement('INPUT');
    buttonNext.setAttribute('type', 'submit');
    buttonNext.value = 'Siguiente';
    buttonNext.setAttribute('id', 'siguiente');
    buttonNext.disabled = true;
    quiz.append(buttonNext);

    const divReloj = document.createElement('DIV')
    const pReloj = document.createElement('P')
    const timeSpan = document.createElement('SPAN')
    divReloj.setAttribute('id', 'timer')
    pReloj.textContent = `Tiempo Restante`
    timeSpan.setAttribute('id', 'time')
    timeSpan.textContent=10;
    divReloj.append(pReloj, timeSpan)
    quiz.append(divReloj)
};
window.onload = startTimer;


function startTimer() {
    timeLeft = 10;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            validateResponse(null, null, true);
            disableButtons() 
        } else {
            timeLeft--;
            document.getElementById('time').textContent = timeLeft;
        }
    }, 1000);
}

const validateResponse = (value, button, timeOut = false) => {
    const buttons = document.querySelectorAll('button');
    if (!timeOut) {
        if (value === results[index].correct_answer) {
        button.classList.add('styleOptionActive');
        respuestas.push(1);
        } else {
        respuestas.push(0);
        button.classList.add('styleOptionInactive');
        }
    }else {
        respuestas.push(0);
    }
    const botonCorrecto = [...buttons].find((element) => element.value === results[index].correct_answer);
        if (botonCorrecto) {
            botonCorrecto.classList.add('styleOptionActive');
        }
    disableButtons()
    document.getElementById('siguiente').disabled = false;
};
const disableButtons =()=> {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

const printResults = (respuestas) => {
    quiz.innerHTML = '';
    const puntuacion = respuestas.reduce((acc, sum) => acc += sum, 0);
    const divPuntuacion = document.createElement('DIV')
    divPuntuacion.classList.add('divPuntuacion')
    const pResultado = document.createElement('P')
    const textoResultado = document.createElement('P')
    textoResultado.textContent = 'Este ha sido tu resultado'
    pResultado.textContent = `${puntuacion} / 10`
    pResultado.classList.add('stylePuntuacion')
    divPuntuacion.append(pResultado)

    score.points = puntuacion;
    scores.push(score);
    const divChartContainer = document.createElement('DIV')
    divChartContainer.classList.add('divChartContainer','ct-chart', 'ct-perfect-fourth', 'styleGrafica')
    const textoChart = document.createElement('P')
    textoChart.classList.add('textoChart')
    textoChart.textContent = 'Estas son tus puntuaciones'
    quiz.append(textoResultado, divPuntuacion, textoChart, divChartContainer)

    const data = {
        labels: scores.map(resultado => resultado.date),
        series: [[1,2,3,4,5,6,7,8,9,10]] //[scores.map(resultado => resultado.points)]
    }
    const options = {
        showPoint: false,
        showArea: true,
        fullWidth: true,
        axisX: {
            showGrid: false
        },
        axisY: {
            low: 0,
            high: 10,
            onlyInteger: true,
            referenceValue: 5,
            showGrid: false
        }
    }
    const chart = new Chartist.Line('.ct-chart', data, options);
    chart.on('draw', function(context) {
        if (context.type === 'line') {
            context.element.attr({
                style: 'stroke: rgb(255, 0, 170); stroke-width: 8px;'
            });
        }
        if (context.type === 'area') {
            context.element.attr({
                style: 'fill: rgb(255, 0, 170);'
            });
        }
    });
}

const validateInicio = (valueOption) => {
    const container1 = document.querySelector('#modal-container1');
    const container2 = document.querySelector('#modal-container2');

    if (valueOption === 'play') {
        console.log('hola');
        window.location.href = 'questions.html';
    } else if (valueOption== 'registro') {
        console.log('registro')
        container1.showModal()
    } else if (valueOption== 'login') {
        console.log('login')
        container2.showModal();
    } 
};

//animacion tiempo
//Guardar en firebase y LocalStorage


