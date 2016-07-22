<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

/**
 * This view represents the lobby where players choose their decks and create or join games.
 *
 * @package OracionOnline\Views
 */
class LobbyView implements IView
{

    public function invoke(Session $session) : string
    {
        $html = file_get_contents("templates/Lobby.html");
        $html = str_replace("[[EMAIL]]", $session->name, $html);
        return $html;
    }
}