import { boardData, saveBoardData } from "./data.js";
import { getColumn } from "./utils.js";

export const changeListColour = (colourValue, columnId) => {
    const { columnElem, dataColumn } = getColumn(columnId);
    if (!columnElem || !dataColumn){return;}

    columnElem.style.backgroundColor = colourValue;
    dataColumn.listColour = colourValue;
    saveBoardData();
}

export const changeCardColour = (colourValue, columnId) => {
    const { columnElem, dataColumn } = getColumn(columnId);
    if (!columnElem || !dataColumn){return;}

    columnElem.querySelectorAll('.cards').forEach(card => {
        card.style.backgroundColor = colourValue;
    });
    dataColumn.cardColour = colourValue;
    saveBoardData();
}

export const changeListTextColour = (colourValue, columnId) => {
    const { columnElem, dataColumn } = getColumn(columnId);
    if (!columnElem || !dataColumn){return;}

    columnElem.querySelectorAll('h2, button').forEach(el => {
        el.style.color = colourValue;
    });
    columnElem.querySelector('img').style.color = colourValue;
    dataColumn.listTextColour = colourValue;
    saveBoardData();
}

export const changeCardTextColour = (colourValue, columnId) => {
    const { columnElem, dataColumn } = getColumn(columnId);
    if (!columnElem || !dataColumn){return;}

    columnElem.querySelectorAll('.cards').forEach(card => {
        card.style.color = colourValue;
    });
    dataColumn.cardTextColour = colourValue;
    saveBoardData();
}