const keyboardInputField = document.querySelector('textarea');
keyboardInputField.focus();





// Networking

let IP_ADDRESS = new URL(window.location.href).hostname.replace('www.','');
let PORT = 6969;

function throwConnectionError() {
    window.alert(`Failed to send message to ${IP_ADDRESS} on port ${PORT}.`);
}





// DOM Events

keyboardInputField.addEventListener('input', (event) => { 
    if (event.data === null) {
        return;
    }

    sendText(keyboardInputField.value);

    keyboardInputField.value = '';
});

keyboardInputField.addEventListener('paste', (event) => {
    var clipboardData = event.clipboardData || event.originalEvent.clipboardData || window.clipboardData;
    var pastedData = clipboardData.getData('text');

    if (pastedData === null) {
        return;
    }

    sendText(keyboardInputField.value);

    keyboardInputField.value = '';
});

keyboardInputField.addEventListener('keydown', function (event) {
    if (event.key === 'Backspace') {
        sendBackspaceKey();
    }
    else if (event.key === 'Enter') {
        sendEnterKey();
    }
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

function sendEnterKey() {
    console.log('Sending "Enter" key...');

    fetch(`http://${IP_ADDRESS}:${PORT}/enter`, {
        method: 'POST'
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

function sendBackspaceKey() {
    console.log('Sending "Backspace" key...');

    fetch(`http://${IP_ADDRESS}:${PORT}/backspace`, {
        method: 'POST'
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
