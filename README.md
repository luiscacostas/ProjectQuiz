# Proyecto Quiz
Este proyecto es una aplicación de quiz que permite a los usuarios registrarse, iniciar sesión y participar en un juego de preguntas y respuestas. La aplicación también almacena y muestra las puntuaciones de los usuarios.

------------


####  Tabla de Contenidos
1. Instalación
2. Uso
3. Código
4. Configuración de Firebase
5. Autenticación de Usuarios
6. Juego de Quiz
7. Mostrar Resultados
8. Contribuciones
9. Licencia
10. Autores
11. Instalación

##### Para instalar y configurar el proyecto, sigue estos pasos:

##### Clona el repositorio a tu máquina local.
git clone https://github.com/tu-usuario/proyecto-grupal-quiz.git

------------

Los usuarios pueden registrarse y autenticarse utilizando Firebase Authentication.
Se soporta el inicio de sesión mediante Google.

#### Juego de Quiz:

Los usuarios pueden jugar un quiz de 10 preguntas obtenidas de Open Trivia Database.
Se muestra el temporizador y se almacenan las respuestas.
Puntuaciones y Resultados:

Al final del quiz, se muestra la puntuación obtenida.
Las puntuaciones se almacenan localmente y se muestran en un gráfico.

Configuración de Firebase.
El proyecto utiliza Firebase para la autenticación de usuarios y Firestore para almacenar los datos de los jugadores.

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "proyecto-grupal-quiz.firebaseapp.com",
    projectId: "proyecto-grupal-quiz",
    storageBucket: "proyecto-grupal-quiz.appspot.com",
    messagingSenderId: "596977327919",
    appId: "1:596977327919:web:21c896093f84fd41274bda"
};
```

```javascript
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

------------


##### Autenticación de Usuarios
El código siguiente maneja la persistencia de sesión y la autenticación con Google.

```javascript
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("Persistencia de sesión configurada a LOCAL");
    })
    .catch((error) => {
        console.error("Error configurando la persistencia de sesión:", error.message);
    });
```

```javascript
let provider = new firebase.auth.GoogleAuthProvider();
auth.languageCode = "es";

const loginGoogle = async () => {
    try {
        const response = await firebase.auth().signInWithPopup(provider);
        console.log(response);
        return response.user;
    } catch (error) {
        throw new Error(error)
    }
};
```
##### Juego de Quiz
El siguiente código maneja la obtención de datos del API, la visualización del quiz y el temporizador.

```javascript
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

```
```javascript
const printQuiz = (results, i) => {
    startTimer();
    if (index === 10) {
        printResults(respuestas);
        return;
    }

    quiz.innerHTML = '';
    options = shuffle([...results[i].incorrect_answers, results[i].correct_answer]);
    const pregunta = document.createElement('H3');
    pregunta.classList.add('styleParrafoPregunta');
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

    const buttonHome = document.createElement('BUTTON');
    buttonHome.textContent = 'Volver al Menu Principal';
    buttonHome.classList.add('buttonHomeStyle');
    quiz.append(buttonHome);

    const divReloj = document.createElement('DIV');
    const timeSpan = document.createElement('P');
    divReloj.setAttribute('id', 'timer');
    timeSpan.setAttribute('id', 'time');
    timeSpan.textContent = 10;
    divReloj.append(timeSpan);
    quiz.append(divReloj);

    buttonHome.addEventListener('click', () => {
        window.location.href = 'home.html';
    });
};

function startTimer() {
    timeLeft = 10;
    clearInterval(timer);
    timer = setInterval(() => {
        const timerElement = document.getElementById('time');
        if (!timerElement) return;
        if (timeLeft <= 0) {
            clearInterval(timer);
            validateResponse(null, null, true);
            disableButtons();
            document.getElementById('time').textContent = 'Tiempo Agotado';
        } else {
            timeLeft--;
            document.getElementById('time').textContent = timeLeft;
        }
    }, 1000);
}
```
##### Mostrar Resultados

El siguiente código maneja la visualización de los resultados y la creación de un gráfico con las puntuaciones.

```javascript
const printResults = (respuestas) => {
    quiz.innerHTML = '';
    const puntuacion = respuestas.reduce((acc, sum) => acc += sum, 0);
    const divPuntuacion = document.createElement('DIV');
    divPuntuacion.classList.add('divPuntuacion');
    const pResultado = document.createElement('P');
    const textoResultado = document.createElement('P');
    textoResultado.textContent = 'Tu resultado';
    textoResultado.classList.add('textoChart');
    pResultado.textContent = `${puntuacion} / 10`;
    pResultado.classList.add('stylePuntuacion');
    divPuntuacion.append(pResultado);

    const newScore = {
        date: fecha,
        points: puntuacion
    };
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));
    const storedScores = JSON.parse(localStorage.getItem("scores"));
    const divChartContainer = document.createElement('DIV');
    divChartContainer.classList.add('divChartContainer', 'ct-chart', 'ct-perfect-fourth', 'styleGrafica');
    const textoChart = document.createElement('P');
    textoChart.classList.add('textoChart');
    textoChart.textContent = 'Tus puntuaciones';
    const btnReturnPlay = document.createElement('BUTTON');
    btnReturnPlay.textContent = 'Volver a Jugar';
    btnReturnPlay.classList.add('btnReturnPlay');
    const divScores = document.createElement('DIV');
    divScores.classList.add('styleGrafica');
    storedScores.forEach(score => {
        const logScores = document.createElement('P');
        logScores.innerHTML = `Fecha: ${score.date} - <strong>Puntuación: ${score.points}</strong>`;
        divScores.append(logScores);
    });

    quiz.append(textoResultado, divPuntuacion, textoChart, divChartContainer, btnReturnPlay);

    btnReturnPlay.addEventListener('click', () => {
        index = 0;
        respuestas = [];
        score.points = 0;
        getData();
    });

    const data = {
        labels: scores.map(resultado => resultado.date),
        series: [scores.map(resultado => resultado.points)]
    };
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
    };
    const chart = new Chartist.Line('.ct-chart', data, options);
    chart.on('draw', function (context) {
        if (context.type === 'point') {
            context.element.attr({
                style: 'stroke: rgb(255, 87, 199); stroke-width: 12px;'
            });
        }
        if (context.type === 'line') {
            context.element.attr({
                style: 'stroke: rgb(255, 87, 199);'
            });
        }
    });
};
```
##### Persistencia de Datos
Los datos de las puntuaciones se almacenan en localStorage para ser recuperados y mostrados posteriormente.

##### Manejo del Temporizador
El temporizador controla el tiempo de respuesta para cada pregunta. Si el tiempo se agota, se pasa a la siguiente pregunta automáticamente.

##### Manejo de Errores
El manejo de errores se realiza principalmente mediante bloques try-catch para capturar y manejar errores en la obtención de datos del API y la autenticación de usuarios.

Autores
#Luis Carlos Acosta - Full Stack.
#Eduardo Fatou - Full Stack.
#Roberto Ruano - Full Stack.
