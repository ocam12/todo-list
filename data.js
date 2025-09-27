import { defaultBoardColour, LOCAL_STORAGE_KEY } from "./constants.js";

//main board data object - holds all lists, cards, colours etc and is accessed globally
export const boardData = {
    columns: [],
    boardColour: defaultBoardColour
}

//saves the board by converting to JSON and pushing to local storage
export const saveBoardData = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boardData));
}

//loads board data from local storage, parses it, and adds to our board data object
export const loadBoardData = () => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData){
        const parsedData = JSON.parse(savedData);       //parses back to object
        boardData.columns = parsedData.columns || [];       //sets each value one by one to prevent overwriting whole object
        boardData.boardColour = defaultBoardColour;
    }
}