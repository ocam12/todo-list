import { defaultCardColour, defaultCardTextColour, defaultListColour, defaultListTextColour } from "./constants.js";
import { boardData, saveBoardData, loadBoardData } from "./data.js";
import { changeCardColour, changeCardTextColour, changeListColour, changeListTextColour } from "./colours.js";
import { createButton, createDiv, createH2, getColumn } from "./utils.js";

const board = document.getElementById('board');

//create list menu and applicable colour pickers
const createColourPicker = (labelText, initialValue, onChangeFunction, columnId) => {
    const container = document.createElement('div');
    container.classList.add('colour-picker-container');
    const label = document.createElement('p');
    label.innerText = labelText;

    const picker = document.createElement('input');
    picker.type = 'color'; //makes it a color picker
    picker.value = initialValue;
    picker.classList.add('colour-picker');
    picker.addEventListener('input', (e) => {onChangeFunction(e.target.value, columnId);});
    
    container.appendChild(label);
    container.appendChild(picker);
    return container;
}

const createAllColourPickers = (dropDown, column) => {
    const pickers = [
        ['List Colour: ', column.listColour, changeListColour, column.id],
        ['Card Colour: ', column.cardColour, changeCardColour, column.id],
        ['List Text Colour: ', column.listTextColour, changeListTextColour, column.id],
        ['Card Text Colour: ', column.cardTextColour, changeCardTextColour, column.id],
    ];

    pickers.forEach(([label, colourValue, onChangeFunction, columnId]) => {
        const pickerElement = createColourPicker(label, colourValue, onChangeFunction, columnId);
        dropDown.appendChild(pickerElement);
    });
}

const createDropDownElement = (column) => {
    //drop-down div
    const dropDown = document.createElement('div');
    dropDown.classList.add('drop-down', 'hidden');  //display off by default

    //change colour button
    const deleteListButton = createButton('Delete List', 'delete-list-button', () => deleteList(column.id));

    createAllColourPickers(dropDown, column);
    dropDown.appendChild(deleteListButton);
    return dropDown;
}

//updates boardData object with new positions of lists
const reinitialiseLists = (evt) => {
    const fromIndex = evt.oldIndex;
    const toIndex = evt.newIndex;
    if (fromIndex === toIndex){return;}     //exits early if not moved

    const list = boardData.columns.splice(fromIndex,1)[0];
    boardData.columns.splice(toIndex, 0, list);
    saveBoardData();
}

//updates the boardData object with new positions of cards - called everytime a card is moved
const reinitialiseCards = (evt) => {
    //evt is the event called when card moved
    const movedCardID = evt.item.dataset.id;
    const fromColumnID =evt.from.parentElement.dataset.id;
    const toColumnID = evt.to.parentElement.dataset.id;
    const newIndex = evt.newIndex;

    if (!movedCardID || !fromColumnID || !toColumnID){return;}

    const fromColumn = boardData.columns.find(col => col.id === fromColumnID);
    const toColumn = boardData.columns.find(col => col.id === toColumnID);

    if (!fromColumn || !toColumn){return;}

    const oldCardIndex = fromColumn.cards.findIndex(card => card.id === movedCardID);  //finds index of card in old list
    const [movedCard] = fromColumn.cards.splice(oldCardIndex, 1);  //gets moved card object and removes it from old column

    //adds card to new list
    toColumn.cards.splice(newIndex, 0, movedCard);
    saveBoardData();
}

const createColumnElement = (column) => {
    //column div
    const columnElem = createDiv('column');
    columnElem.dataset.id = column.id;
    
    //title h2
    const titleElem = createH2(column.title);
    titleElem.addEventListener('click', () => { //add on click event to add card
        changeListTitle(column.id);
    });

    //dot img and container
    const dropDownToggle = createDiv('drop-down-toggle');
    const dots = document.createElement('img');
    dots.src = 'img/three-dots.svg'
    dots.alt = 'Column options';
    dots.role = 'button';
    dots.tabIndex = 0;
    dots.addEventListener("click", () => { //add on click event to dots
        dropDownOn(column.id);
    });
    dots.tabIndex = 0;

    //drop-down
    const dropDown = createDropDownElement(column);

    //column header div (holds h2 and img)
    const columnHeader = createDiv('column-header');

    dropDownToggle.appendChild(dropDown);
    dropDownToggle.appendChild(dots);
    columnHeader.appendChild(titleElem);
    columnHeader.appendChild(dropDownToggle);
    columnElem.appendChild(columnHeader);

    return columnElem;
}

const createCardContainerElement = (column) => {
    //column's card container div
    const cardContainer = document.createElement('ul');
    cardContainer.classList.add('card-container');
    cardContainer.dataset.id = `${column.id}c`;
    
    //for each card in that column create a list item and append it to container
    column.cards.forEach(card => {
        const cardElem = createCardElement(card, column);
        cardContainer.appendChild(cardElem);
    });
    return cardContainer;
}

const createCardElement = (card, column) => {
    //individual card li
    const cardElem = document.createElement('li');
    cardElem.classList.add('cards');
    cardElem.innerText = card.title;
    cardElem.style.backgroundColor = column.cardColour;
    cardElem.style.color = column.cardTextColour;
    cardElem.dataset.id = card.id;
    return cardElem;
}

const createAddCardButton = (column) => {
    //add card button
    const addCardButton = createButton('+ Add a card', 'add-card-button', () => addCard(addCardButton.dataset.id));
    addCardButton.dataset.id = `${column.id}b`;
    return addCardButton;
}

const createAddListButton = (board) => {
    //add list button
    const addListButton = createButton('+ Add a list', 'add-list-button', () => addList(addListButton));
    addListButton.style.backgroundColor = defaultListColour;
    board.appendChild(addListButton);
}

const addDragAndDrop = (board) => {
    //drag and drop functionality on the lists using SortableJS
    new Sortable(board, {
        animation: 150,
        filter: '.temporary, .add-list-button',
        preventOnFilter: false,     //prevents filtered elements from being swapped
        draggable: '.column',    //only columns are draggable

        onEnd: function (evt) { //on move event
            reinitialiseLists(evt); //remake board object
        }
    });

    //drag and drop functionality on the cards using SortableJS
    const sortableColumns = document.querySelectorAll('.card-container');
    sortableColumns.forEach(column => {
        new Sortable(column, {
            group: 'shared',    //each column has same group so cards can be moved between them
            animation: 150,

            onEnd: function (evt) { //on move event
                reinitialiseCards(evt); //remake board object
            }
        });
    });
}

//generates the main board using our boardData object
const generateBoard = () => {
    board.innerHTML = '';   //gets board html and clears it
    board.style.backgroundColor = boardData.boardColour;

    boardData.columns.forEach(column => {   //for each column we have in our board, create a column div and a ul that contains cards
        const columnElem = createColumnElement(column);
        columnElem.appendChild(createCardContainerElement(column));
        columnElem.appendChild(createAddCardButton(column));
        board.appendChild(columnElem); //appened each column to board
        changeListColour(column.listColour, column.id);
        changeListTextColour(column.listTextColour, column.id);
    });

    createAddListButton(board);  //creates the add list button that goes on end of board
}

//if user clicks add list button
const addList = (addListButton) => {
    const board = document.getElementById('board');

    if (!addListButton.parentElement.classList.contains('column')){
        //new column div
        const newColumn = document.createElement('div');
        newColumn.classList.add('column');
        newColumn.classList.add('temporary');
        newColumn.style.backgroundColor = defaultListColour

        //column title h2
        const listInput = document.createElement('input');
        listInput.classList.add('list-input');

        newColumn.appendChild(listInput);
        newColumn.appendChild(addListButton);
        board.appendChild(newColumn);
        listInput.focus();  //focus on new input 
    }
    else{
        const listInput = addListButton.parentElement.querySelector('.list-input');
        if (listInput.value.trim() !== '' && listInput.value !== ''){
            createListObject(listInput.value);
            generateBoard();    //regenerates board with new list
        }
    }
}

const createListObject = (title) => {
    const newList = {
        id: 'col' + Date.now(),
        title: title,
        cards:[],
        listColour: defaultListColour,
        cardColour: defaultCardColour
    }
    boardData.columns.push(newList);
}

//if user clicks add card button
const addCard = (buttonId) => {
    const newId = buttonId.slice(0, -1);

    boardData.columns.forEach(column => {
        if (column.id === newId){
            const { columnElem, columnData } = getColumn(newId);

            const newInput = columnElem.querySelector('.card-input');
            if (!newInput){
                const cardInput = document.createElement('input');
                cardInput.classList.add('card-input');
                columnElem.querySelector('.card-container').appendChild(cardInput);
                cardInput.focus();
            }
            else{
                if (newInput.value){
                    //creates new card with inputted title
                    createCardObject(column, newInput.value);
                    generateBoard();    //regenerates board with new card
                    addCard(`${column.id}b`);
                }
            }
        }
    });
}

const createCardObject = (column, cardTitle) => {
    const newCard = {
        id: 'card-' + Date.now(),
        title: cardTitle
        };

    column.cards.push(newCard);
}

const changeListTitle = (listID) => {
    const { columnElem, columnData} = getColumn(listID);
    const header = columnElem.querySelector('.column-header') 
    const titleInput = document.querySelector('.title-input');
    //if new title input active
    if (titleInput){
        if (titleInput.value){
            //update actual column with new title
            const title = createH2(titleInput.value);
            title.addEventListener("click", () => { //add on click event to add card
                changeListTitle(listID);
            });
            header.replaceChild(title, titleInput);

            //update column object with its new title
            const columnObject = boardData.columns.find(col => col.id === listID);
            columnObject.title = titleInput.value;
            saveBoardData();
        }
    } else{
        const title = columnElem.querySelector('h2');
        const titleInput = document.createElement('input');
        titleInput.classList.add('title-input');
        header.replaceChild(titleInput, title);
        titleInput.focus();
        saveBoardData();
    }
}

//if user clicks enter, we want to add the card they've written
document.addEventListener('keydown', function(event){
    if (event.key === 'Enter') {
        //gets element of focus
        const activeElem = document.activeElement;

        //if element of focus is one of our inputs...
        if (activeElem.classList.contains('card-input')){
            //gets grandparent (column) of input
            const columnGrandparent = activeElem.parentElement.parentElement.dataset;
            
            //enters the inputs text and creates card
            addCard(columnGrandparent.id + 'b');
        }else if (activeElem.classList.contains('list-input')){
            addList(document.querySelector('.add-list-button'));
        }else if (activeElem.classList.contains('title-input')){
            changeListTitle(activeElem.parentElement.parentElement.dataset.id);
        }
    }
});

//deletes input if click outside
document.addEventListener('mousedown', (event) => {
    //finds every column
    document.querySelectorAll('.column').forEach(column => {
        //finds the input (or null) in that column - there can only ever be one
        const cardInput = column.querySelector('.card-input');
        //if input exists, and the target of click is neither the add button or the input itself, delete the input
        if (cardInput !== null && event.target !== cardInput && event.target !== column.querySelector('.add-card-button')){
            cardInput.remove();
        }
    });
    
    const listInput = board.querySelector('.list-input');
    const tempColumn = board .querySelector('.temporary');
    if (listInput !== null && event.target !== listInput && event.target !== tempColumn && event.target !== tempColumn.querySelector('.add-list-button')){
        tempColumn.remove();
        generateBoard();
    }

    const titleInput = board.querySelector('.title-input');
    if (titleInput !== null && event.target !== titleInput){
        generateBoard();
    }

    const openDropDowns = document.querySelectorAll('.drop-down');
    openDropDowns.forEach(drop => {
        if (event.target !== drop && event.target !== drop.parentElement && !drop.contains(event.target)){
            drop.classList.add('hidden');
        }
    });
});

const dropDownOn = (columdId) => {
    const { columnElem, columnData } = getColumn(columdId);
    const dropDown = columnElem.querySelector('.drop-down');
    if (dropDown.classList.contains('hidden')){
        dropDown.classList.remove('hidden');
    }else {
        dropDown.classList.add('hidden');
    }
}

const deleteList = (columdId) => {
    boardData.columns.splice(boardData.columns.findIndex(col => col.id === columdId), 1);
    generateBoard();
}

/*
const changeBoardColour = () => {
    const colourValue = document.querySelector('.board-colour-picker').value;
    document.getElementById('board').style.backgroundColor = colourValue;
    boardData.boardColour = colourValue;
    saveBoardData();
}*/

const initBoard = () => {
    generateBoard();
    addDragAndDrop(board);  //gives drag and drop functionality to board via SortableJS
}

loadBoardData();
initBoard();    //initalise board