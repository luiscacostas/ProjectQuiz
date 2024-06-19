const firebaseConfig = {
    apiKey: "AIzaSyAKHibe1airIWT3eiUCfL4WMWILNU9ZmIs",
    authDomain: "proyecto-grupal-quiz.firebaseapp.com",
    projectId: "proyecto-grupal-quiz",
    storageBucket: "proyecto-grupal-quiz.appspot.com",
    messagingSenderId: "596977327919",
    appId: "1:596977327919:web:21c896093f84fd41274bda"
};

firebase.initializeApp(firebaseConfig);// Inicializaar app Firebase

const db = firebase.firestore();// db representa mi BBDD //inicia Firestore

let quiz = document.querySelector('.quiz');
let options = [];
let results = [];
let index = 0;
let respuestas = [];
let fecha = new Date().toLocaleDateString('es-ES', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
});
let btnHome = document.querySelector('#btnContenedor');
const btnLogin = document.querySelector('#login');
const btnRegister = document.querySelector('#registro');
const score = {
    date: fecha,
    points: 0
};
let scores = JSON.parse(localStorage.getItem("scores")) || [];
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

document.addEventListener('submit', (event)=>{
    event.preventDefault();
    if (event.target.id == "form1"){
        let email = event.target.elements.email.value;
        let password = event.target.elements.pass.value;
        signUpPlayer(email, password)
    } else if (event.target.id == "form2"){
        let email = event.target.elements[0].value;
        let password = event.target.elements[1].value;
        
        loginPlayer(email,password)
    }
})

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
}

const printQuiz = (results, i) => {
    if (index === 10) {
        printResults(respuestas);
        const botonActivo = document.querySelector('.styleOptionActive')
        botonActivo.classList.remove('styleOptionActive')
        return;
    }

    quiz.innerHTML = '';
    options = shuffle([...results[i].incorrect_answers, results[i].correct_answer]);
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
    const timeSpan = document.createElement('P')
    divReloj.setAttribute('id', 'timer')
    timeSpan.setAttribute('id', 'time')
    timeSpan.textContent = 10;
    divReloj.append(timeSpan)
    quiz.append(divReloj)

};

window.onload = startTimer;

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

function startTimer() {
    timeLeft = 10;
    clearInterval(timer);
    timer = setInterval(() => {
        const timerElement = document.getElementById('time');
        if (!timerElement) return;
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
        clearInterval(timer);
        } else {
            respuestas.push(0);
            button.classList.add('styleOptionInactive');
        clearInterval(timer);
        }
    } else {
        respuestas.push(0);
    }
    const botonCorrecto = [...buttons].find((element) => element.value === results[index].correct_answer);
    if (botonCorrecto) {
        botonCorrecto.classList.add('styleOptionActive');
    }
    disableButtons()
    document.getElementById('siguiente').disabled = false;
    
};
const disableButtons = () => {
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
    textoResultado.textContent = 'Tu resultado'
    textoResultado.classList.add('textoChart')
    pResultado.textContent = `${puntuacion} / 10`
    pResultado.classList.add('stylePuntuacion')
    divPuntuacion.append(pResultado)

    const newScore = {
        date: fecha,
        points: puntuacion
    };
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));
    const storedScores = JSON.parse(localStorage.getItem("scores"));
    const divChartContainer = document.createElement('DIV')
    divChartContainer.classList.add('divChartContainer', 'ct-chart', 'ct-perfect-fourth', 'styleGrafica')
    const textoChart = document.createElement('P')
    textoChart.classList.add('textoChart')
    textoChart.textContent = 'Tus puntuaciones'
    const btnReturnPlay = document.createElement('BUTTON')
    btnReturnPlay.textContent='Volver a Jugar'
    btnReturnPlay.classList.add('btnReturnPlay')
    const divScores = document.createElement('DIV');
    divScores.classList.add('styleGrafica');
    storedScores.forEach(score => {
        const logScores = document.createElement('P');
        logScores.innerHTML = `Fecha: ${score.date} - <strong>Puntuación: ${score.points}</strong>`;
        divScores.append(logScores);
    });

    quiz.append(textoResultado, divPuntuacion, textoChart, divChartContainer, divScores,btnReturnPlay)

    btnReturnPlay.addEventListener('click', () => {
        index = 0;
        respuestas = [];
        score.points = 0;
        printQuiz(results, index);
    });

    const data = {
        labels: scores.map(resultado => resultado.date),
        series: [scores.map(resultado => resultado.points)]
    }
    const options = {
        showPoint: false,
        showArea: true,
        fullWidth: false,
        chartPadding: {
            top: 40,
            right: 20,
            bottom: 40
        },
        axisX: {
            showGrid: true
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
    chart.on('draw', function (context) {
        if (context.type === 'point') {
            context.element.attr({
                style: 'stroke: rgb(255, 87, 199); stroke-width: 12px;'
            });
        }
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
    chart.on('created', function () {
        const axisXLabels = document.querySelectorAll('.ct-label.ct-horizontal');
        axisXLabels.forEach(function (label) {
            label.style.transform = 'rotate(-45deg) translateX(-40px)';
            label.style.textAnchor = 'end';
            label.style.transformOrigin = '0 50%';
        });
        const linePath = document.querySelector('.ct-series .ct-line');
        if (linePath) {
            const length = linePath.getTotalLength();
            linePath.style.transition = 'none';
            linePath.style.strokeDasharray = length + ' ' + length;
            linePath.style.strokeDashoffset = length;
            linePath.getBoundingClientRect(); // Forzar el reflujo para reiniciar la animación
            linePath.style.transition = 'stroke-dashoffset 2s ease-out';
            linePath.style.strokeDashoffset = '0';
        }
    });
}

const validateInicio = (valueOption) => {
    const container1 = document.querySelector('#modal-container1');
    const container2 = document.querySelector('#modal-container2');
    const cancelarbtn = document.querySelectorAll('.cancelar')

    if (valueOption === 'play') {
        console.log('hola');
        window.location.href = 'questions.html';
    } else if (valueOption == 'registro') {
        console.log('registro')
        container1.showModal()
    } else if (valueOption == 'login') {
        console.log('login')
        container2.showModal();
    } 

    cancelarbtn.forEach((btn)=>{
        btn.addEventListener('click',()=>{
            container1.close()
            container2.close()
    })    //Roberto PERFECCIONARA esto!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
})
};

// AUTENTICACION

const loginPlayer = async (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let player = userCredential.user;
            console.log(`se ha logado ${player.email} ID:${player.uid}`)
            alert(`se ha logado ${player.email} ID:${player.uid}`)
            console.log("PLAYER", player);
            
            //meter la funcion de cerrar el popUp cuando esté
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)

        });

};

const signOutPlayer = () => {
    firebase.auth().signOut().then(() => {
        console.log("Sale del sistema: " + user.email)
    }).catch((error) => {
        console.log("hubo un error: " + error);
    });
    location.reload()
}

const signUpPlayer = (email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async(userCredential) => {
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`)
            alert(`se ha registrado ${user.email} con éxito`)
            await loginPlayer(user.email, user.password)//cuando te das de alta te logea  
            // ...
            // Saves user in firestore
            createPlayer({
                id: user.uid,
                email: user.email,
                imagen: "default",
            });
        })
        .catch((error) => {
            console.log("Error en el sistema" + error.message, "Error: " + error.code);
        });

};

const createPlayer = (player) => {
    db.collection("player")
        .doc(player.email)
        .set(player)
        .then(() => console.log(`usuario guardado correctamente con id: ${player.email}`))
        .catch((error) => console.error("Error adding document: ", error));
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

