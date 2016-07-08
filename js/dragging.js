function drop_handler(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("application/card");
   // console.log(data);
    if (data) {
        var theCard = session.cardsByUniqueIdentifier[data];
        console.log(theCard);
        session.click(theCard);
    }
}
function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}