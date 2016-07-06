<?php
namespace OracionOnline;
use OracionOnline\Views\InGameView;
use OracionOnline\Views\LobbyView;
use OracionOnline\Views\LoginView;
use OracionOnline\Views\WaitingView;

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
        $isAjaxCall = isset($_GET["ajaxAction"]) || isset($_POST["ajaxAction"]);
        if ($isAjaxCall) {
            if (isset($_GET["ajaxAction"]))
            {
                $ajaxResponder = new AjaxResponder($this->session);
                echo $ajaxResponder->invoke($_GET["ajaxAction"], $_GET);
            }
            else {
                $ajaxResponder = new AjaxResponder($this->session);
                echo $ajaxResponder->invoke($_POST["ajaxAction"], $_POST);
            }
            return;
        }
        else if ($this->session->isLoggedIn()) {
            if (isset($_GET["waitForGame"])) {
                $waitingView = new WaitingView((int) $_GET["waitForGame"]);
                echo $waitingView->invoke($this->session);
            } else if (isset($_GET["game"])) {
                if (isset($_GET["deck"])) {
                    $inGameView = new InGameView((int) $_GET["game"], $_GET["deck"]);
                } else {
                    $inGameView = new InGameView((int) $_GET["game"]);
                }
                echo $inGameView->invoke($this->session);
            } else {
                $lobbyView = new LobbyView();
                echo $lobbyView->invoke($this->session);
            }
        } else if (isset($_GET["game"]) && $_GET["game"] == "AI") {
            $inGameView = new InGameView((int) $_GET["game"], "random");
            echo $inGameView->invoke($this->session);
        } else {
            $loginView = new LoginView();
            echo $loginView->invoke($this->session);
        }
    }
}