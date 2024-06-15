let quiz = document.querySelector('.quiz');
let options = [];
let results = [];
let index = 0;
let respuestas = [];
let fecha = new Date().toDateString(); //Fecha para puntuacion
let btnHome = document.querySelector('#btnContenedor');
const btnLogin = document.querySelector('#login');
const btnRegister = document.querySelector('#registro');




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
};

const validateResponse = (value, button) => {
    const buttons = document.querySelectorAll('button');
    if (value === results[index].correct_answer) {
        button.classList.add('styleOptionActive');
        respuestas.push(1);
    } else {
        respuestas.push(0);
        button.classList.add('styleOptionInactive');
       
        const botonCorrecto = [...buttons].find((element) => element.value === results[index].correct_answer);
        if (botonCorrecto) {
            botonCorrecto.classList.add('styleOptionActive');
        }
    }
    const botones = document.querySelectorAll('button');
    botones.forEach(boton => {
        boton.disabled = true;
    });
    document.getElementById('siguiente').disabled = false;
};

const printResults = (respuestas) => {
    quiz.innerHTML = '';
    const puntuacion = respuestas.reduce((acc, sum) => acc + sum, 0);
    const divPuntuacion = document.createElement('DIV');
    divPuntuacion.classList.add('divPuntuacion');
    const pResultado = document.createElement('P');
    const textoResultado = document.createElement('P');
    textoResultado.classList.add('styleParrafoRestultado')
    textoResultado.textContent = 'Este ha sido tu resultado';
    pResultado.textContent = `${puntuacion} / 10`;
    pResultado.classList.add('stylePuntuacion');
    divPuntuacion.append(pResultado);
    quiz.append(textoResultado, divPuntuacion);
};

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
//animacion botones
//Guardar en firebase y LocalStorage
//Crear Usuarios Login y Resistro

// btnLogin.addEventListener('click', ()=>{
//     login.classList.add('showContainer')
// })
// btnRegister.addEventListener('click',()=>{
//     registro.classList.add('showContainer')
// })
// btnCancelar.forEach((boton)=>{
//     boton.addEventListener('click',()=>{
//     registro.classList.remove('showContainer')
//     login.classList.remove('showContainer')
// })
// })

