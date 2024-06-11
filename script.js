const url = 'https://opentdb.com/api.php?amount=10';
const quiz = document.querySelector('.quiz');
let options = [];
let results = [];
let index = 0;
let respuestas = [];
let fecha = new Date().toDateString() //Fecha para puntuacion

quiz.addEventListener('click', (ev)=>{
    ev.preventDefault()

    if(ev.target.tagName === 'BUTTON'){
        const valueOption = ev.target.value
        validateResponse(valueOption, ev.target)
    }
    if (ev.target.id === 'siguiente') {
        index++;
        printQuiz(results, index)
    }
})

const getData = async () => {
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            const data = await resp.json();
            results = data.results;
            printQuiz(results, index);
        } else {
            throw new Error('Error al obtener los datos');
        }
    } catch (error) {
        console.error(error);
    }
}

const printQuiz = (results, i) => {
    quiz.innerHTML = '';
    options = [...results[i].incorrect_answers, results[i].correct_answer];
    const pregunta = document.createElement('H3')
    pregunta.textContent = results[i].question;
    quiz.append(pregunta)

    options.forEach((opc, index) => {
        const buttonOption = document.createElement('BUTTON')
        buttonOption.textContent = opc;
        buttonOption.setAttribute('id', `option${index+1}`)
        buttonOption.classList.add(`option${index+1}`)
        buttonOption.value = opc
        quiz.append(buttonOption)
    });
    const buttonNext = document.createElement('INPUT')
    buttonNext.setAttribute('type', 'submit')
    buttonNext.value= 'Siguiente'
    buttonNext.setAttribute('id', 'siguiente')
    buttonNext.disabled = true;
    quiz.append(buttonNext)

    if(index === 9){
        printResults(respuestas)
    }
};

const validateResponse = (value, button)=>{
    const buttons = document.querySelectorAll('button')
    if(value === results[index].correct_answer){
        button.classList.add('styleOptionActive')
        respuestas.push(1);
    }else{
        respuestas.push(0);
        button.classList.add('styleOptionInactive')
       
        const botonCorrecto = [...buttons].find((element)=> element.value === results[index].correct_answer)
        if(botonCorrecto){
            botonCorrecto.classList.add('styleOptionActive')
        }
    }
    const botones = document.querySelectorAll('button');
    botones.forEach(boton => {
        boton.disabled = true;
    });
    document.getElementById('siguiente').disabled = false;
    
}

const printResults = (respuestas) => {
    quiz.innerHTML='';

    const puntuacion = respuestas.reduce((acc, sum) => acc += sum, 0);

    const divPuntuacion = document.createElement('DIV')
    divPuntuacion.classList.add('divPuntuacion')
    const pResultado = document.createElement('P')
    const textoResultado = document.createElement('P')
    textoResultado.textContent = 'Este ha sido tu resultado'
    pResultado.textContent = `${puntuacion} / 10`
    pResultado.classList.add('stylePuntuacion')
    divPuntuacion.append(pResultado, )
    quiz.append(textoResultado, divPuntuacion)
}

getData()

//animacion tiempo
//animacion botones
//Guardar en firebase y LocalStorage
//Crear Usuarios Login y Resistro

