<?php
namespace OracionOnline;
class Session
{
    public function isLoggedIn() : bool {
        return false;
    }

    public static function Construct() : Session
    {
        session_start();
        $session = new Session();
        return $session;
    }
    private function __construct() {

    }
}