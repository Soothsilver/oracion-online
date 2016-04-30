<?php
namespace OracionOnline;
use OracionOnline\Views\LobbyView;
use OracionOnline\Views\LoginView;

class FrontController
{
    /**
     * @var Session
     */
    private $session;
    public function __construct($session)
    {
        $this->session = $session;
    }

    public function invoke()
    {
        $isAjaxCall = isset($_GET["ajaxAction"]);
        if ($isAjaxCall) {
            $ajaxResponder = new AjaxResponder($this->session);
            echo $ajaxResponder->invoke($_GET["ajaxAction"]);
            return;
        }
        if ($this->session->isLoggedIn()) {
            $lobbyView = new LobbyView();
            echo $lobbyView->invoke($this->session);
        } else {
            $loginView = new LoginView();
            echo $loginView->invoke($this->session);
        }
    }
}