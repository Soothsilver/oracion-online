<?php
namespace OracionOnline\Views;
use OracionOnline\Doctrine;
use OracionOnline\Models\User;
use OracionOnline\Session;

class LoginView implements IView
{
    private $errorMessage = "";
    private $loginSuccessful = false;

    public function invoke(Session $session) : string
    {
        if (isset($_POST["action"])) {
            if ($this->performLoginAction()) {
                $lobby = new LoginView();
                return $lobby->invoke($session);
            }
        }
        $loginUserIfAny = isset($_POST["login"]) ? $_POST["login"] : "";
        $registerUserIfAny = isset($_POST["reglogin"]) ? $_POST["reglogin"] : "";
        if ($this->errorMessage != "") {
            $this->errorMessage = "<div class='error'>" . $this->errorMessage . "</div>";
        }
        $html = file_get_contents("templates/Login.html");
        $html = str_replace("[[ERROR-MESSAGES]]", $this->errorMessage, $html);
        $html = str_replace("[[OLD-LOGIN]]", $loginUserIfAny, $html);
        $html = str_replace("[[OLD-REGISTER-LOGIN]]", $registerUserIfAny, $html);
        return $html;
    }

    private function performLoginAction() : bool
    {
        $action = $_POST["action"];
        if ($action == "login")
        {
            $name = isset($_POST["login"]) ? $_POST["login"] : "";
            $pass = isset($_POST["password"]) ? $_POST["password"] : "";

        }
        else if ($action == "register")
        {
            $name = isset($_POST["reglogin"]) ? $_POST["reglogin"] : "";
            $pass = isset($_POST["password"]) ? $_POST["password"] : "";
            if (!filter_var($name, FILTER_VALIDATE_EMAIL)) {
                $this->errorMessage = "E-mail nemá správný formát.";
                return false;
            }
            if (strlen($pass) < 5 || strlen($pass) > 200) {
                $this->errorMessage = "Heslo musí mít mezi 5 a 200 znaky.";
                return false;
            }
            $newUser = new User();
            $newUser->email = $name;
            $newUser->hashedPassword = password_hash($pass, PASSWORD_DEFAULT);
            $newUser->lastHeartbeat = new \DateTime('now');
            $newUser->gamesStarted = 0;
            $newUser->gamesWon = 0;
            Doctrine::$entityManager->persist($newUser);
            Doctrine::$entityManager->flush($newUser);
            $this->errorMessage = "Uživatel zaregistrován.";
            return false;
        }
        else
        {
            $this->errorMessage = "Tato akce není k dispozici.";
            return false;
        }
    }
}