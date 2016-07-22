<?php
namespace OracionOnline;
use OracionOnline\Models\User;

/**
 * An instance of this class is all we keep in the session. Basically, we only need information on the currently logged-in user.
 * This class also encapsulates functionality on logging in, and logging out.
 * @package OracionOnline
 */
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

  /**
   * Private, because we only want to construct this class via the static factory method.
   */
    private function __construct() {

    }

    public function loginComplete($id, $name)
    {
        $this->loggedIn = true;
        $this->id = $id;
        $this->name = $name;
        $this->lastHeartbeat = new \DateTime();
    }

  /**
   * Destroys the session, basically. Does not require database access.
   */
    public function logout()
    {
        $this->loggedIn = false;
    }

  /**
   * @return User The logged in user as a Doctrine model. It is an error to call this when not logged in.
   */
    public function getUser() : User
    {
        return Doctrine::getEntityManager()->find(Doctrine::USER, $this->id);
    }
}