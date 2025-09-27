import { boardData } from "./data.js";

export const createButton = (text, className, onClick) => {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.classList.add(className);
    btn.addEventListener('click', onClick);
    btn.tabIndex = 0;
    return btn;
}

export const createDiv = (className) => {
    const div = document.createElement('div');
    div.classList.add(className);
    return div;
}

export const createH2 = (text, className) => {
    const h2 = document.createElement('h2');
    h2.innerText = text;
    return h2;
}

export const getColumn = (columnId) => {
    const columnElem = document.querySelector(`[data-id="${columnId}"]`);
    const dataColumn = boardData.columns.find(col => col.id === columnId);
    return { columnElem, dataColumn };
}