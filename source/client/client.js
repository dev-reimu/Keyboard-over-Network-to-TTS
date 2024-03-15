const keyboardInputField = document.querySelector('textarea');
keyboardInputField.focus();





// Networking

let IP_ADDRESS = new URL(window.location.href).hostname.replace('www.','');
let PORT = 7979;

function throwConnectionError() {
    window.alert(`Failed to send message to ${IP_ADDRESS} on port ${PORT}.`);
}




// Countdown

const maxCountdown = 2;
let currentCountdown;

function resetCountdown() {
    currentCountdown = maxCountdown;
}

function countdown() {
    if (keyboardInputField.value === '') {
        return;
    }

    currentCountdown -= 1;

    if (currentCountdown <= 0) {
        sendText(keyboardInputField.value);
        keyboardInputField.value = '';
    }
}
setInterval(() => { countdown() }, 1000);





// DOM Events

keyboardInputField.addEventListener('input', (event) => { 
    if (event.data === null) {
        return;
    }

    resetCountdown();
});

keyboardInputField.addEventListener('paste', (event) => {
    var clipboardData = event.clipboardData || event.originalEvent.clipboardData || window.clipboardData;
    var pastedData = clipboardData.getData('text');

    if (pastedData === null) {
        return;
    }

    resetCountdown();
});





// Networking

function sendText(text) {
    console.log(`Sending "${text}"...`);

    fetch(`http://${IP_ADDRESS}:${PORT}/input`, {
        method: 'POST',  
        headers: {
            'Content-Type': 'text/plain'
        }, 
        body: text
    })
    .then(res => {
        if (res.status !== 200) {
            throwConnectionError();
        }
    })
    .catch(_ => {
        throwConnectionError();
    });
}
