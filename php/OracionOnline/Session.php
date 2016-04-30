<?php
namespace OracionOnline;
use OracionOnline\Models\User;

class Session
{
    public $id = null;
    public $name;
    public $loggedIn = false;
    public $lastHeartbeat;

    public static function saveChanges(Session $session)
    {
        $_SESSION["session"] = $session;
    }

    public function isLoggedIn() : bool {
        return $this->loggedIn;
    }

    public static function Construct() : Session
    {
        session_start();
        if (isset($_SESSION["session"])) {
            $session = $_SESSION["session"];
        } else {
            $session = new Session();
        }
        return $session;
    }
    private function __construct() {

    }

    public function loginComplete($id, $name)
    {
        $this->loggedIn = true;
        $this->id = $id;
        $this->name = $name;
        $this->lastHeartbeat = new \DateTime();
    }

    public function logout()
    {
        $this->loggedIn = false;
    }

    public function getUser() : User
    {
        return Doctrine::getEntityManager()->find(Doctrine::USER, $this->id);
    }
}