<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

class LobbyView implements IView
{

    public function invoke(Session $session) : string
    {
        $html = file_get_contents("templates/Lobby.html");
        $html = str_replace("[[EMAIL]]", $session->name, $html);
        return $html;
    }
}