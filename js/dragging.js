// This file contains HTML5 drag-and-drop API functions for moving cards from hand into the arena.

function drop_handler(ev) {
    ev.preventDefault();
    //noinspection JSUnresolvedVariable
    var data = ev.dataTransfer.getData("application/card");
    if (data) {
        var theCard = session.cardsByUniqueIdentifier[data];
        console.log(theCard);
        session.click(theCard);
    }
}
function dragover_handler(ev) {
    ev.preventDefault();
    //noinspection JSUnresolvedVariable
    ev.dataTransfer.dropEffect = "move";
}