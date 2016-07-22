<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

/**
 * This view represents the in-game screen where two players play a game against each other.
 * @package OracionOnline\Views
 */
class InGameView implements IView
{
    private $id;
    private $deck;

    public function __construct(int $id, string $deck = null)
    {
        $this->id = $id;
        $this->deck = $deck;
    }

    public function invoke(Session $session) : string
    {
        $html = file_get_contents("templates/Ingame.html");
        $html = str_replace("[[ID]]", $this->id, $html);
        $html = str_replace("[[DECK]]", $this->deck, $html);
        return $html;
    }
}