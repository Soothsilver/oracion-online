<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

/**
 * This view represents the screen where the host player waits for another player to join his or her game.
 * @package OracionOnline\Views
 */
class WaitingView implements IView
{
    private $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public function invoke(Session $session) : string
    {
        $html = file_get_contents("templates/Waiting.html");
        $html = str_replace("[[ID]]", $this->id, $html);
        $html = str_replace("[[EMAIL]]", $session->name, $html);
        return $html;
    }
}