const firebaseConfig = {
    apiKey: "AIzaSyAKHibe1airIWT3eiUCfL4WMWILNU9ZmIs",
    authDomain: "proyecto-grupal-quiz.firebaseapp.com",
    projectId: "proyecto-grupal-quiz",
    storageBucket: "proyecto-grupal-quiz.appspot.com",
    messagingSenderId: "596977327919",
    appId: "1:596977327919:web:21c896093f84fd41274bda"
};

firebase.initializeApp(firebaseConfig);// Inicializaar app Firebase
const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("Persistencia de sesión configurada a LOCAL");
    })
    .catch((error) => {
        console.error("Error configurando la persistencia de sesión:", error.message);
    });

let provider = new firebase.auth.GoogleAuthProvider();

auth.languajeCode = "es";

const db = firebase.firestore();


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
const btnOptions = document.querySelector('#optionsContainer')
const btnLogin = document.querySelector('#login');
const btnRegister = document.querySelector('#registro');
const score = {
    date: fecha,
    points: 0
};
let scores = JSON.parse(localStorage.getItem("scores")) || [];
let timeLeft = 10;
let timer;
const container1 = document.querySelector('#modal-container1');
const container2 = document.querySelector('#modal-container2');
let imagenPerfil = document.querySelector('.profileImagen')
let divImagenFav = document.querySelector('.subirImagen')

document.addEventListener('DOMContentLoaded', () => {

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Usuario está logueado:", user.email);
            menuPlayer();
            displayImage(user.photoURL || '../assets/image_defecto.png');
        } else {
            console.log("Usuario no está logueado");
        }})

    if (btnOptions) {
        btnOptions.addEventListener('click', (ev) => {
            if (ev.target.value == 'salir del perfil') {
                console.log("dentro del boton salir")
                signOutPlayer()
            } else if (ev.target.value == 'cambiar imagen') {
                const subirImagen = document.querySelector('#subirImagen')
                subirImagen.showModal();
            } else if (ev.target.value == 'borrar cuenta'){
                deletePlayer();
                location.reload();
            }
        }

        )
    }


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
            } /*else if (ev.target.classList.contains('cancelar')) {
                console.log("entro en cancelar")
                if (container1.open === true){
                    container1.close();
                } else if (container2 === false){
                    container2.close();
                }
            }*/
        });
        getData();
    }

    if (container2) {
        container2.addEventListener('click', async (ev) => {
            if (ev.target.id === 'btnGoogle') {
                try {
                    await loginGoogle();
                    menuPlayer();
                    const user = firebase.auth().currentUser
                    console.log(user.uid, user.email)
                    console.log("he cerrado la ventana")
                    console.log(user.uid, user.email)
                    createPlayer({
                        id: user.uid,
                        email: user.email,
                        imagen: "gs://proyecto-grupal-quiz.appspot.com/images/yGWbojjZ0ucnertBphwkNtCShcg2.jpg",
                    });
                    container2.close();
                    console.log("he creado el usuario en la BBDD")
                } catch (error) { }
            }
        })
    }
});

document.addEventListener('submit', (event) => {
    event.preventDefault();
    if (event.target.id == "form1") {
        let email = event.target.elements.email.value;
        let password = event.target.elements.pass.value;
        signUpPlayer(email, password)
    } else if (event.target.id == "form2") {
        let email = event.target.elements[0].value;
        let password = event.target.elements[1].value;

        loginPlayer(email, password)
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
    startTimer()
    if (index === 10) {
        printResults(respuestas);
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

    const buttonHome = document.createElement('BUTTON')
    buttonHome.textContent = 'Volver al Menu Principal';
    buttonHome.classList.add('buttonHomeStyle')
    quiz.append(buttonHome)

    const divReloj = document.createElement('DIV')
    const timeSpan = document.createElement('P')
    divReloj.setAttribute('id', 'timer')
    timeSpan.setAttribute('id', 'time')
    timeSpan.textContent = 10;
    divReloj.append(timeSpan)
    quiz.append(divReloj)

    buttonHome.addEventListener('click', () => {
        window.location.href = 'home.html';
    })

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
            document.getElementById('time').textContent = 'Tiempo Agotado';
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
};

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
    btnReturnPlay.textContent = 'Volver a Jugar'
    btnReturnPlay.classList.add('btnReturnPlay')
    const divScores = document.createElement('DIV');
    divScores.classList.add('styleGrafica');
    storedScores.forEach(score => {
        const logScores = document.createElement('P');
        logScores.innerHTML = `Fecha: ${score.date} - <strong>Puntuación: ${score.points}</strong>`;
        divScores.append(logScores);
    });

    quiz.append(textoResultado, divPuntuacion, textoChart, divChartContainer, btnReturnPlay)

    btnReturnPlay.addEventListener('click', () => {
        index = 0;
        respuestas = [];
        score.points = 0;
        getData();
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
    const popUpOpciones = document.querySelector('#options')
    const container3 = document.querySelector('#modal-container3');
    const cancelarbtn = document.querySelectorAll('.cancelar')
    const subirImagen = document.querySelector('#subirImagen')

    if (valueOption === 'play') {
        console.log('hola');
        window.location.href = 'questions.html';
    } else if (valueOption == 'registro') {
        console.log('registro')
        container1.showModal()
    } else if (valueOption == 'login') {
        console.log('login')
        container2.showModal();
    } else if (valueOption == 'Opciones') {
        popUpOpciones.showModal();
    } else if (valueOption == 'salir del perfil') {
        console.log("dentro del boton salir")
        signOutPlayer()
    }

    cancelarbtn.forEach((btn) => {
        btn.addEventListener('click', () => {
            container1.close()
            container2.close()
            popUpOpciones.close()
            container3.close()
            subirImagen.close()
        })
    })
};

// AUTENTICACION

const loginGoogle = async () => {
    try {
        const response = await firebase.auth().signInWithPopup(provider);
        console.log(response);
        return response.user;
    } catch (error) {
        throw new Error(error)
    }
};

const loginPlayer = async (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const container2 = document.querySelector('#modal-container2');
            // Signed in
            let player = userCredential.user;
            console.log(`se ha logado ${player.email} ID:${player.uid}`)
            if (container2.open == true) {
                container2.close()
            }//cierra el popUp si esta abierto
            alert(`se ha logado ${player.email} ID:${player.uid}`)
            console.log("PLAYER", player);
            //cambia el menú y muetra la imagen de usuario
            menuPlayer();
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
    //const container1 = document.querySelector('#modal-container1');
    let email1 = email;
    let password1 = password;
    firebase
        .auth()
        .createUserWithEmailAndPassword(email1, password1)
        .then(async (userCredential) => {
            let user = userCredential.user;
            console.log(`se ha registrado ${email1} ID:${user.uid}`)
            alert(`se ha registrado ${email1} con éxito`)
            await loginPlayer(email1, password1)
            // ...
            // Saves user in firestore
            createPlayer({
                id: user.uid,
                email: user.email,
                imagen: "gs://proyecto-grupal-quiz.appspot.com/images/yGWbojjZ0ucnertBphwkNtCShcg2.jpg",
            });
            container1.close()
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

const deletePlayer = async () => {
    const user = firebase.auth().currentUser;
    try{
    await deleteDoc(doc(db, "player", user.uid));
    await user.delete()
} catch (error) {
    alert ("no se ha podido borrar el usuario")
}
}

const menuPlayer = () => {
    const btnLogin = document.querySelector('#btnLogin');
    const btnRegister = document.querySelector('#btnRegistro');
    const btnContenedor = document.querySelector('#btnContenedor');
    console.log(btnContenedor);
    console.log(btnRegister);
    btnLogin.remove();
    btnRegister.remove();

    const btnOpciones = document.createElement('button');
    btnOpciones.classList.add('btnInicio');
    btnOpciones.value = 'Opciones';
    btnOpciones.textContent = 'Opciones de usuario';

    btnContenedor.append(btnOpciones)
};

//imagen usuario

const uploadFile = () => {
    const file = document.getElementById("files").files[0];
    const user = firebase.auth().currentUser;
    const storageRef = firebase.storage().ref();
    const thisRef = storageRef.child(`images/${user.uid}.jpg`);

    thisRef.put(file).then((snapshot) => {
        alert("Imagen subida");
        console.log('Imagen subida correctamente!');
        return thisRef.getDownloadURL();
    }).then((url) => {
        return user.updateProfile({
            photoURL: url
        }).then(() => {
            console.log("Perfil actualizado con la nueva imagen");
            displayImage(url);
        });
    }).catch((error) => {
        console.error("Error al subir imagen o actualizar perfil: ", error);
        alert("Error al subir imagen o actualizar perfil.");
    });
}
document.getElementById("uploadButton").addEventListener("click", uploadFile);

const displayImage = (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.classList.add('styleProfile')
    imagenPerfil.innerHTML = '';
    imagenPerfil.append(img);
    divImagenFav.style.display = 'none'
}

