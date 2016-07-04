<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

class InGameView implements IView
{
    private $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public function invoke(Session $session) : string
    {
        $html = file_get_contents("templates/Ingame.html");
        return $html;
    }
}