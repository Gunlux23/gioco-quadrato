// Il gioco consiste nello spostare tutti i quadrati piccoli dentro il quadrato grande nel piu breve tempo possibile

var numPedine = 10;
var startTime = 0;
var timerId = null;
var pedineCompletate = 0;
var CLASSIFICA_KEY = 'classificaGiocoQuadrato';
var MAX_POSIZIONI = 3;

// Mostra la classifica centrata appena la pagina è pronta
document.addEventListener('DOMContentLoaded', function() {
	renderClassifica(document.getElementById('classificaListaPre'));
});

// Metodo da utilizzare sempre (previene il comportamento default deciso dal browser)
function allowDrop(evento) {
	evento.preventDefault();
}

// Funzione per avviare il gioco
function startCronometro() {
	var pedine = document.getElementById('pedine');
	var bottoneStart = document.getElementById('startButton');
	bottoneStart.disabled = true;

	// nasconde la classifica centrale
	document.getElementById('classificaPre').classList.add('nascosta');

	// pulisce eventuali pedine residue da una partita precedente
	pedine.innerHTML = '';
	pedineCompletate = 0;

	for (var i = 1; i <= numPedine; i++) {
		var newPedina = document.createElement('div');
		var newParagrafo = document.createElement('p');
		newParagrafo.textContent = 'Blocco ' + i;
		newParagrafo.className = 'testo';
		newPedina.appendChild(newParagrafo);

		newPedina.className = 'piccolo';
		newPedina.draggable = true;
		newPedina.ondragstart = drag;
		newPedina.id = 'pedina' + i;		// id senza spazi

		pedine.appendChild(newPedina);
	}
	pedine.style.display = 'block';

	// avvia il cronometro
	startTime = Date.now();
	timerId = setInterval(updateCronometro, 50);
}

// Funzione per fermare il cronometro
function stopCronometro() {
	if (timerId !== null) {
		clearInterval(timerId);
		timerId = null;
	}
}

// Funzione per aggiornare il display del cronometro
function updateCronometro() {
	var trascorsi = Date.now() - startTime;
	document.getElementById('cronometro').value = formatTempo(trascorsi);
}

// Formatta i millisecondi nel formato m:ss:cc (minuti:secondi:centesimi)
function formatTempo(ms) {
	var totSec = Math.floor(ms / 1000);
	var minuti = Math.floor(totSec / 60);
	var secondi = totSec % 60;
	var centesimi = Math.floor((ms % 1000) / 10);
	return minuti + ':' + pad2(secondi) + ':' + pad2(centesimi);
}

function pad2(n) {
	return n < 10 ? '0' + n : '' + n;
}

// Funzione che si attiva quando inizio a trascinare la pedina
function drag(evento) {
	// passo al drop l'id dell'elemento trascinato
	evento.dataTransfer.setData('text/plain', evento.target.id);
	console.log("Elemento trascinato:", evento.target.id);
}

// Funzione che verifica se sei stato bravo (drop sul quadrato rosso)
function bravo(evento) {
	evento.preventDefault();
	var idTrascinato = evento.dataTransfer.getData('text/plain');
	var elemento = document.getElementById(idTrascinato);
	if (!elemento) return;

	// la pedina sparisce una volta trascinata nel quadrato rosso
	elemento.remove();
	pedineCompletate++;

	// se sono state spostate tutte: fine partita
	if (pedineCompletate === numPedine) {
		finePartita();
	}
}

// Mostra l'overlay con il tempo finale e la classifica
function finePartita() {
	stopCronometro();
	var trascorsi = Date.now() - startTime;
	var tempoFinale = formatTempo(trascorsi);

	salvaTempo(trascorsi);

	document.getElementById('cronometro').value = tempoFinale;
	document.getElementById('tempoFinale').textContent = tempoFinale;
	renderClassifica(document.getElementById('classificaOverlay'));
	document.getElementById('overlay').className = 'overlay-visibile';
}

// Resetta tutto, nasconde l'overlay e riporta la classifica al centro
function riavvia() {
	document.getElementById('overlay').className = 'overlay-nascosta';
	document.getElementById('cronometro').value = '0:00:00';
	document.getElementById('startButton').disabled = false;

	var pedine = document.getElementById('pedine');
	pedine.innerHTML = '';
	pedine.style.display = 'none';

	// svuota il quadrato rosso da eventuali pedine rimaste
	var quadratiRossi = document.getElementsByClassName('medio');
	for (var i = 0; i < quadratiRossi.length; i++) {
		quadratiRossi[i].innerHTML = '';
	}

	pedineCompletate = 0;

	// rimostra la classifica centrata e la aggiorna
	renderClassifica(document.getElementById('classificaListaPre'));
	document.getElementById('classificaPre').classList.remove('nascosta');
}

// --- Gestione classifica (top 3 in localStorage) ---

function leggiClassifica() {
	try {
		var data = localStorage.getItem(CLASSIFICA_KEY);
		var arr = data ? JSON.parse(data) : [];
		return Array.isArray(arr) ? arr : [];
	} catch (e) {
		return [];
	}
}

function salvaTempo(ms) {
	var classifica = leggiClassifica();
	classifica.push(ms);
	classifica.sort(function(a, b) { return a - b; });
	classifica = classifica.slice(0, MAX_POSIZIONI);
	try {
		localStorage.setItem(CLASSIFICA_KEY, JSON.stringify(classifica));
	} catch (e) {
		// localStorage non disponibile: ignoro silenziosamente
	}
	return classifica;
}

function renderClassifica(contenitore) {
	if (!contenitore) return;
	var classifica = leggiClassifica();
	if (classifica.length === 0) {
		contenitore.innerHTML = '<p class="classifica-vuota">Nessun tempo registrato</p>';
		return;
	}
	var html = '<table class="classifica-tabella"><tbody>';
	for (var i = 0; i < classifica.length; i++) {
		var posizione = i + 1;
		html += '<tr class="pos-' + posizione + '">' +
			'<td class="cella-pos"><span class="badge-pos">' + posizione + '</span></td>' +
			'<td class="cella-tempo">' + formatTempo(classifica[i]) + '</td>' +
		'</tr>';
	}
	html += '</tbody></table>';
	contenitore.innerHTML = html;
}
