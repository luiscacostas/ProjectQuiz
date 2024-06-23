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
const container3 = document.querySelector('#modal_ranking')
let imagenPerfil = document.querySelector('.profileImagen')
let divImagenFav = document.querySelector('.subirImagen')
let dialogImagen = document.querySelector('#subirImagen')
let resultsPage = document.querySelector('.results');
let contenedorFormularios = document.querySelector('.results_btn')
let contenedorRanking = document.querySelector('.ranking')
let topScores = [];
const audioMain = document.querySelector('#audioMain')
const audioquiz = document.querySelector('#audioquiz')
const audioCoin = document.querySelector('#audioCoin')
const btnGameOver = document.querySelector('#audioGameOver')
const audioResults = document.querySelector('#audioResults')

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Usuario está logueado:", user.email);
            menuPlayer();
            displayImage(user.photoURL || '../assets/image_defecto.png');
        } else {
            console.log("Usuario no está logueado");
        }
    })

    if (resultsPage) {
        printResultsPage();
    }

    if (btnOptions) {
        btnOptions.addEventListener('click', (ev) => {
            if (ev.target.value == 'salir del perfil') {
                console.log("dentro del boton salir")
                signOutPlayer()
            } else if (ev.target.value == 'cambiar imagen') {
                const subirImagen = document.querySelector('#subirImagen')
                const archivoImagen = document.querySelector('#archivoImagen')
                subirImagen.showModal();
                if (archivoImagen.style.display == 'none') {
                    archivoImagen.style.display = 'block';
                }
            } else if (ev.target.value == 'borrar cuenta') {
                deletePlayer();

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
            }
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
            printQuiz(results, index);
        } else {
            throw new Error('Error al obtener los datos');
        }
    } catch (error) {
        console.error(error);
    }
}

const printQuiz = (results, i) => {
    startTimer();
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
        window.location.href = '../home.html';
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
            btnGameOver.play();
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
            audioCoin.play();
            respuestas.push(1);
            clearInterval(timer);
        } else {
            respuestas.push(0);
            button.classList.add('styleOptionInactive');
            btnGameOver.play();
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

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const playerID = db.collection('player').doc(user.email);
            const doc = await playerID.get();
            if (doc.exists) {
                const playerData = doc.data();
                console.log('Datos del jugador:', playerData);
                //localStorage.setItem('playerData', JSON.stringify(playerData));
            } else {
                console.log('No se encontró el documento del jugador');
            }
        } catch (error) {
            console.error('Error al obtener datos del jugador:', error);
        }
    } else {
        console.log('Usuario no autenticado');
    }
});


const printResults = async (respuestas) => {
    audioquiz.pause();
    audioResults.play();
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

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const playerID = db.collection('player').doc(user.email);
                const doc = await playerID.get();
                if (doc.exists) {
                    const playerData = doc.data();
                    await db.collection('scores').add({
                        uid: playerData.id,
                        date: newScore.date,
                        points: newScore.points
                    });
                    console.log('Puntuacion guardada en Firestore');
                } else {
                    console.log('No se encontro el documento del jugador');
                }
            } catch (error) {
                console.error('Error al guardar en Firestore:', error);
            }
        } else {
            scores.push(newScore);
            localStorage.setItem("scores", JSON.stringify(scores));
        }

        let storedScores;
        if (user) {
            try {
                const playerID = db.collection('player').doc(user.email);
                const doc = await playerID.get();
                if (doc.exists) {
                    const playerData = doc.data();
                    const querySnapshot = await db.collection('scores').where('uid', '==', playerData.id).get();
                    storedScores = querySnapshot.docs.map(doc => doc.data());
                } else {
                    console.log('No se encontr贸 el documento del jugador');
                }
            } catch (error) {
                console.error('Error al obtener datos de Firestore:', error);
            }
        } else {
            storedScores = JSON.parse(localStorage.getItem("scores")) || [];
        }

        const divChartContainer = document.createElement('DIV')
        divChartContainer.classList.add('divChartContainer', 'ct-chart', 'ct-perfect-fourth', 'styleGrafica')
        const textoChart = document.createElement('P')
        textoChart.classList.add('textoChart')
        textoChart.textContent = 'Tus puntuaciones'
        const btnReturnPlay = document.createElement('BUTTON')
        btnReturnPlay.textContent = 'Volver a Jugar'
        btnReturnPlay.classList.add('btnReturnPlay')
        btnReturnPlay.setAttribute('value', 'pepito');
        const divScores = document.createElement('DIV');
        divScores.classList.add('styleGrafica');
        storedScores.forEach(score => {
            const logScores = document.createElement('P');
            logScores.innerHTML = `Fecha: ${score.date} - <strong>Puntuaci贸n: ${score.points}</strong>`;
            divScores.append(logScores);
        });
        const buttonHome = document.createElement('BUTTON')
        buttonHome.textContent = 'Volver al Menu Principal';
        buttonHome.classList.add('buttonHomeStyle')

        buttonHome.addEventListener('click', () => {
            window.location.href = '../home.html';
        })

        btnReturnPlay.addEventListener('click', () => {
            index = 0;
            respuestas = [];
            score.points = 0;
            audioResults.pause();
            audioquiz.play();
            getData();
        });
        
        quiz.append(textoResultado, divPuntuacion, textoChart, divChartContainer, btnReturnPlay, buttonHome)    
        
        const data = {
            labels: storedScores.map(resultado => resultado.date),
            series: [storedScores.map(resultado => resultado.points)]
        }
        const options = {
            showPoint: true,
            showArea: true,
            fullWidth: false,
            chartPadding: {
                top: 40,
                right: 20,
                bottom: 40
            },
            axisX: {
                showGrid: true,
                labelInterpolationFnc: function(value, index) {
                    const totalLabels = data.labels.length;
                    const step = Math.ceil(totalLabels / 10);
                    return index % step === 0 ? value : null;
                }
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
                    style: 'stroke: rgb(255, 0, 170); stroke-width: 8px;'
                });
            }
            if (context.type === 'line') {
                context.element.attr({
                    style: 'stroke: rgb(255, 0, 170) stroke-width: 8px;'
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
                label.style.fontSize = '15px'; 
                label.style.color = '#333';
            });
            const linePath = document.querySelector('.ct-series .ct-line');
            if (linePath) {
                const length = linePath.getTotalLength();
                linePath.style.transition = 'none';
                linePath.style.strokeDasharray = length + ' ' + length;
                linePath.style.strokeDashoffset = length;
                linePath.getBoundingClientRect();
                linePath.style.transition = 'stroke-dashoffset 3s ease-out';
                linePath.style.strokeDashoffset = '0';
            }
        });
    });
}

const printResultsPage = async () => {
    const resultsPage = document.querySelector('.results');
    if (!resultsPage) return;

    let storedScores;

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const playerID = db.collection('player').doc(user.email);
                const doc = await playerID.get();
                if (doc.exists) {
                    const playerData = doc.data();
                    const querySnapshot = await db.collection('scores').where('uid', '==', playerData.id).get();
                    storedScores = querySnapshot.docs.map(doc => doc.data());
                } else {
                    console.log('No se encontró el documento del jugador');
                }
            } catch (error) {
                console.error('Error al obtener datos de Firestore:', error);
            }
        } else {
            storedScores = JSON.parse(localStorage.getItem("scores")) || [];
        }

        resultsPage.innerHTML = '';

        const divChartContainer = document.createElement('DIV')
        divChartContainer.classList.add('divChartContainer', 'ct-chart', 'ct-perfect-fourth', 'styleGrafica')
        const textoChart = document.createElement('P')
        textoChart.classList.add('textoChart')
        textoChart.textContent = 'Tus puntuaciones'
        const divScores = document.createElement('DIV');
        divScores.classList.add('styleScores');
        storedScores.forEach(score => {
            const logScores = document.createElement('P');
            logScores.innerHTML = `Fecha: ${score.date} - <strong>Puntuación: ${score.points}</strong>`;
            divScores.append(logScores);
        });

        resultsPage.append(textoChart, divChartContainer, divScores);

        const data = {
            labels: storedScores.map(resultado => resultado.date),
            series: [storedScores.map(resultado => resultado.points)]
        }
        const options = {
            showPoint: true,
            showArea: true,
            fullWidth: false,
            chartPadding: {
                top: 40,
                right: 20,
                bottom: 40
            },
            axisX: {
                showGrid: true,
                labelInterpolationFnc: function(value, index) {
                    const totalLabels = data.labels.length;
                    const step = Math.ceil(totalLabels / 10);
                    return index % step === 0 ? value : null;
                }
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
                    style: 'stroke: rgb(255, 0, 170); stroke-width: 8px;'
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
                label.style.fontSize = '15px'; 
                label.style.color = '#333';
            });
            const linePath = document.querySelector('.ct-series .ct-line');
            if (linePath) {
                const length = linePath.getTotalLength();
                linePath.style.transition = 'none';
                linePath.style.strokeDasharray = length + ' ' + length;
                linePath.style.strokeDashoffset = length;
                linePath.getBoundingClientRect();
                linePath.style.transition = 'stroke-dashoffset 3s ease-out';
                linePath.style.strokeDashoffset = '0';
            }
        });
        const buttonHome = document.createElement('BUTTON')
        buttonHome.textContent = 'Volver al Menu Principal';
        buttonHome.classList.add('buttonHomeStyle')
        resultsPage.append(buttonHome)

        buttonHome.addEventListener('click', () => {
            window.location.href = '../home.html';
        })


    });
}

const validateInicio = (valueOption) => {
    const popUpOpciones = document.querySelector('#options')
    const container3 = document.querySelector('#modal-container3');
    const cancelarbtn = document.querySelectorAll('.cancelar')
    const subirImagen = document.querySelector('#subirImagen')

    if (valueOption === 'play') {
        window.location.href = 'pages/questions.html';
    } else if (valueOption == 'registro') {
        container1.showModal()
    } else if (valueOption == 'login') {
        container2.showModal();
    } else if (valueOption == 'ranking') {
        getTopScores()
        container3.showModal();
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
    const user = firebase.auth().currentUser
    try {
        const response = await firebase.auth().signInWithPopup(provider);
        container2.close()
        if (user.photoURL) {
            displayImage(user.photoURL);

        } else { displayImage() }

        return response.user;
    } catch (error) {
        throw new Error(error)
    }
};

const loginPlayer = async (email, password) => {
    const user = firebase.auth().currentUser
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
            if (user.photoURL) {
                console.log(user.photoURL)
                displayImage(user.photoURL);
            } else {
                displayImage()
            };
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
    try {
        const user = firebase.auth().currentUser;
        console.log(user)
        user.delete().then(() => {
            location.reload()
          }).catch((error) => {
            console.log(error)
          });
        if (!user) {
            throw new Error('No user is currently signed in.');
        }
        ;
    } catch (error) {
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

    contenedorFormularios.addEventListener('click', () => {
        window.location.href = './pages/results.html';
    })

};
//Cargar Imagen de Usuario 
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
            dialogImagen.close();
        });
    }).catch((error) => {
        console.error("Error al subir imagen o actualizar perfil: ", error);
        alert("Error al subir imagen o actualizar perfil.");
    });
}
document.getElementById("uploadButton").addEventListener("click", uploadFile);

const displayImage = (url = '../assets/image_defecto.png') => {
    const img = document.createElement('img');
    img.src = url;
    img.classList.add('styleProfile')
    imagenPerfil.innerHTML = '';
    imagenPerfil.append(img);
}

const getTopScores = async () => {
    try {
        const scoresCollection = db.collection('scores').orderBy('points', 'desc').limit(10);
        const querySnapshot = await scoresCollection.get();

        topScores = [];
        querySnapshot.forEach((doc) => {
            
            topScores.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log(topScores)
        pintarRanking(topScores)
    } catch (error) {
        console.error('Error al obtener los top scores:', error);
        throw error;
    }
}

const pintarRanking = (topScores)=>{
    container3.innerHTML = '';
    topScores.forEach((top)=>{
        console.log(top.points)
        const tr = document.createElement('tr')
        const td_id = document.createElement('td')
        const td_date = document.createElement('td')
        const td_score = document.createElement('td')
        tr.classList.add('styleTabla')
        td_id.textContent = top.id;
        td_date.textContent = top.date;
        td_score.textContent = top.points;

        tr.append(td_id, td_date, td_score)
        container3.append(tr)
    })
}
