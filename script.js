let readFromStorage = false;
let srcData;
const header = document.createElement('div');
const inputWord = document.createElement('input');
const wrapper = document.createElement('div');
const resultDiv = document.createElement('div');
const wordKeeperBtn = document.createElement('button');
const starredBtn = document.createElement('button');
const popupBlock = document.createElement('div');
const popupExit = document.createElement('button');
const inputBlock = document.createElement('div');
const adjectiveBlock = document.createElement('div');
const verbBlock = document.createElement('div');
const nounBlock = document.createElement('div');
const checkBoxAdjective = document.createElement('input');
const checkBoxVerb = document.createElement('input');
const checkBoxNoun = document.createElement('input');
const labelAdjective = document.createElement('label');
const labelVerb = document.createElement('label');
const labelNoun = document.createElement('label');

function renderBasicElements() {	
	header.classList.add('header');
	document.body.append(header);
	document.body.append(inputBlock);
	inputBlock.classList.add('inputBlock');
	inputWord.classList.add('inputWord');
	inputBlock.append(inputWord);
	wrapper.classList.add('wrapper');
	document.body.append(wrapper);	
	resultDiv.classList.add('resultDiv');
	resultDiv.innerText = 'Start typing an English word and the search will start automatically after the 2nd character.'
	wrapper.append(resultDiv);	
	wordKeeperBtn.innerText = 'Word Keeper';
	header.append(wordKeeperBtn);
	headerTitle = document.createElement('h1');
	headerTitle.classList.add('headerTitle');
	headerTitle.innerText = 'Word Keeper';
	header.append(headerTitle);	
	starredBtn.innerText = 'Starred Words';
	header.append(starredBtn);	
	popupBlock.classList.add('popupBlock');
}

async function searchWords(query) {
	if (readFromStorage) {		
	    if(query == null || query == undefined){			
				renderWords(filterPartsOfSpeech(getAllFromStorage()));			         
        } else {
			renderWords(filterWords(filterPartsOfSpeech(getAllFromStorage()), query));
		}		
		console.log('FROM STORAGE');
	} else {
		console.log('FROM INTERNET');
		renderWords(await getWordsFromAPI(query));
	}
}

async function getWordsFromAPI(query) {
	return transformData(await queryWords(query));
}

async function queryWords(query) {
	const urlRequest = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";
	const apiKey = "987d80ad-5490-47e5-ad84-955a3ff73fa2";
	let searchString = urlRequest + query + "?key=" + apiKey;
	console.log('searchString:' + searchString);
	const res = await fetch(searchString);
	let result = await res.json();
	console.log('await:', result);
	return result;
}

class Word {
	constructor(wordName, fl, shortdef) {
		this.wordName = wordName;
		this.fl = fl;
		this.shortdef = shortdef;
	}
}

function transformData(srcData) {
	console.log('srcData', srcData);
	let dataArr = [];
	for (let i = 0; i < srcData.length; i++) {
		let word = srcData[i].hwi.hw;
		let fl = srcData[i].fl;
		let shortdef = srcData[i].shortdef[0];
		let wordObj = new Word(word, fl, shortdef);
		console.log('wordObj', wordObj);
		dataArr.push(wordObj);
	}
	console.log('transformData', dataArr);
	return dataArr;
}

function createWord(word) {
	const wordDiv = document.createElement('div');
	wordDiv.classList.add('row');
	const wordP = document.createElement('p');
	wordP.classList.add('word');
	wordDiv.append(wordP);
	wordP.innerText = word.wordName;
	wordP.addEventListener('click', event => renderPopupInfo(word));
	const flP = document.createElement('p');
	flP.classList.add('fl');
	flP.innerText = word.fl;
	wordDiv.append(flP);
	const trans = document.createElement('p');
	trans.classList.add('trans');
	wordDiv.append(trans);
	trans.innerText = word.shortdef;
	const star = document.createElement('img');
	star.classList.add('addFavorites');
	if (readFromStorage) {
		star.src = 'img/starminus.jpg';
		star.addEventListener('click', event => {
			removeFromStorage(word);
			searchWords(inputWord.value);
		});
	} else {
		if (isFromStorage(word.wordName)) {
			star.src = 'img/stardone.jpg';
		} else {
			star.src = 'img/starplus.jpg';
			star.addEventListener('click', event => {
				pushToStorage(word);
				searchWords(inputWord.value);
			});
		}
	}
	wordDiv.append(star);
	return wordDiv;
}

function renderWords(words) {
	console.log('renderWords:' + words);
	resultDiv.innerHTML = '';
	for (let i = 0; i < words.length; i++) {
		resultDiv.append(createWord(words[i]));
	}
}

function initStorage() {
	let rowsMap = localStorage.getItem("rows");
	if (rowsMap == null) {
		rowsMap = new Map();
		localStorage.setItem("rows", JSON.stringify(rowsMap));
	}
}

function pushToStorage(word) {
	let rowsMap = JSON.parse((localStorage.getItem("rows")));
	console.log('MAP!!!', rowsMap);
	rowsMap[word.wordName] = word;
	localStorage.setItem('rows', JSON.stringify(rowsMap));
}

function removeFromStorage(word) {
	let rowsMap = JSON.parse(localStorage.getItem("rows"));
	delete rowsMap[word.wordName];
	localStorage.setItem('rows', JSON.stringify(rowsMap));
}

function getFromStorage(wordName) {
	let rowsMap = JSON.parse(localStorage.getItem("rows"));
	return rowsMap[wordName];
}

function isFromStorage(wordName) {
	let foundWord = getFromStorage(wordName);
	return foundWord != null && foundWord != undefined && foundWord != '';
}

function getAllFromStorage() {
	let rowsMap = JSON.parse(localStorage.getItem("rows"));
	let result = [];
	for (let key in rowsMap) {
		if (rowsMap.hasOwnProperty(key)) {
			let fl = rowsMap[key].fl;
			result.push(rowsMap[key]);
			console.log('getAllFromStorage:' + key + rowsMap[key]);
		}
	}
	return result;
}

function filterWords(words, subStr) {
	if (subStr == null || subStr == undefined) {
		return words;
	}
	let filteredWords = [];
	for (let i = 0; i < words.length; i++) {
		let filterWord = words[i].wordName;
		if (filterWord.includes(subStr)) {
			filteredWords.push(words[i]);
		}
	}
	return filteredWords;
}

function filterPartsOfSpeech(words) {		
	let filteredPartsOfSpeech = [];
	for (let i = 0; i < words.length; i++) {
		let filterpartsofspeech = words[i].fl;	
			if (!checkBoxAdjective.checked && !checkBoxNoun.checked && !checkBoxVerb.checked) {
				filteredPartsOfSpeech.push(words[i]);
				continue;
			}			
			if (!checkBoxAdjective.checked && filterpartsofspeech === "adjective") {
				continue;
			}
			if (!checkBoxNoun.checked && filterpartsofspeech === "noun") {
				continue;
			}
			if (!checkBoxVerb.checked && filterpartsofspeech === "verb") {
				continue;
			}
			filteredPartsOfSpeech.push(words[i]);			
	}		
	return filteredPartsOfSpeech;		
}

function renderCheckBoxBlock() {	
	adjectiveBlock.classList.add('checkBoxLabelBlock');
	verbBlock.classList.add('checkBoxLabelBlock');
	nounBlock.classList.add('checkBoxLabelBlock');
	inputBlock.append(adjectiveBlock);
	inputBlock.append(verbBlock);
	inputBlock.append(nounBlock);
	checkBoxAdjective.type = 'checkbox';
	checkBoxVerb.type = 'checkbox';
	checkBoxNoun.type = 'checkbox';
	checkBoxAdjective.id = 'adjective';
	checkBoxVerb.id = 'verb';
	checkBoxNoun.id = 'noun';
	labelAdjective.innerText = 'adjective';
	labelVerb.innerText = 'verb';
	labelNoun.innerText = 'noun';
	adjectiveBlock.append(checkBoxAdjective);
	adjectiveBlock.append(labelAdjective);
	verbBlock.append(checkBoxVerb);
	verbBlock.append(labelVerb);
	nounBlock.append(checkBoxNoun);
	nounBlock.append(labelNoun);
	checkBoxAdjective.addEventListener('change', event => {
		inputWord.value = '';
		searchWords(inputWord.value);		
	});
	checkBoxVerb.addEventListener('change', event => {
		inputWord.value = '';
		searchWords(inputWord.value);
	});
	checkBoxNoun.addEventListener('change', event => {
		inputWord.value = '';
		searchWords(inputWord.value);
	});
}

function closeInputBlock() {
	adjectiveBlock.innerText = '';
	verbBlock.innerText = '';
	nounBlock.innerText = '';
}

function renderPopupInfo(word) {
	popupBlock.style.visibility = 'visible';
	popupBlock.innerHTML = '';
	const headerPopup = document.createElement('div');
	headerPopup.classList.add('headerPopup');
	popupBlock.append(headerPopup);
	headerPopup.innerText = 'Information about the word'
	let popupInfo = new DocumentFragment();
	const fl = document.createElement('p');
	fl.classList.add('fl');
	popupInfo.append(fl);
	fl.innerText = 'Parts of speech: ' + word.fl;
	const trans = document.createElement('p');
	trans.classList.add('trans');
	popupInfo.append(trans);
	trans.innerText = 'Definitions: ' + word.shortdef;	
	popupBlock.append(popupInfo);	
	popupExit.classList.add('popupExit');
	headerPopup.append(popupExit);
	popupExit.innerText = 'x';	
	wrapper.prepend(popupBlock);
	inputWord.disabled = true;
	wordKeeperBtn.disabled = true;
	starredBtn.disabled = true;
	checkBoxAdjective.disabled = true;
	checkBoxVerb.disabled = true;
	checkBoxNoun.disabled = true;	
	resultDiv.style.opacity = 0.3;
	inputBlock.style.opacity = 0.3;	
	header.style.opacity = 0.3;
}

function closePopupInfo() {
	popupBlock.style.visibility = 'hidden';
	inputWord.disabled = false;
	wordKeeperBtn.disabled = false;
	starredBtn.disabled = false;
	checkBoxAdjective.disabled = false;
	checkBoxVerb.disabled = false;
	checkBoxNoun.disabled = false;
	resultDiv.style.opacity = 1;
	inputBlock.style.opacity = 1;
	header.style.opacity = 1;
}

initStorage();

renderBasicElements();

inputWord.addEventListener('input', event => {
	if (inputWord.value.length > 1 || readFromStorage == true) {
		searchWords(inputWord.value);
	}
});
starredBtn.addEventListener('click', event => {
    inputWord.value = '';
	readFromStorage = true;
	headerTitle.innerText = 'Starred Words';
	searchWords(inputWord.value);
	renderCheckBoxBlock();
});
wordKeeperBtn.addEventListener('click', event => {
	resultDiv.innerHTML = '';
	closeInputBlock();
	readFromStorage = false;
	headerTitle.innerText = 'Word Keeper';
	resultDiv.innerText = 'Start typing an English word and the search will start automatically after the 2nd character.'
	if (inputWord.value.length > 1) {
		searchWords(inputWord.value);
	}
});
popupExit.addEventListener('click', event => closePopupInfo());