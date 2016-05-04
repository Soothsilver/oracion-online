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
            if ($this->performLoginAction($session)) {
                $lobby = new LobbyView();
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

    private function login(Session $session, string $name, string $password) : bool
    {
        /**
         * @var  $user \OracionOnline\Models\User
         */
        $user = Doctrine::getEntityManager()->getRepository(Doctrine::USER)->findOneBy([
           'email' => $name
        ]);
        if ($user == null) {
            $this->errorMessage = "Uživatel s touto e-mailovou adresou neexistuje.";
            return false;
        }
        if (password_verify($password, $user->hashedPassword))
        {
            $session->loginComplete($user->id, $name);
            $user->lastHeartbeat = new \DateTime();
            $user->queued = false;
            Doctrine::getEntityManager()->persist($user);
            Doctrine::getEntityManager()->flush($user);
            return true;
        }
        else
        {
            $this->errorMessage = "Tento uživatelský účet existuje, ale zadali jste nesprávné heslo.";
            return false;
        }
    }
    private function performLoginAction(Session $session) : bool
    {
        $action = $_POST["action"];
        if ($action == "login")
        {
            $name = isset($_POST["login"]) ? $_POST["login"] : "";
            $pass = isset($_POST["password"]) ? $_POST["password"] : "";
            if (!filter_var($name, FILTER_VALIDATE_EMAIL)) {
                $this->errorMessage = "E-mail nemá správný formát.";
                return false;
            }
            if (strlen($pass) < 5 || strlen($pass) > 200) {
                $this->errorMessage = "Heslo musí mít mezi 5 a 200 znaky.";
                return false;
            }
            return $this->login($session, $name, $pass);
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
            try {
                Doctrine::getEntityManager()->persist($newUser);
                Doctrine::getEntityManager()->flush($newUser);
            }
            catch (\Exception $ex)
            {
                $this->errorMessage = "Uživatel s touto e-mailovou adresou již existuje nebo se nepodařilo připojit k databázi.";
                $logger = new \Katzgrau\KLogger\Logger("logs");
                $logger->error($ex->getMessage());
                return false;
            }
            return $this->login($session, $name, $pass);
        }
        else
        {
            $this->errorMessage = "Tato akce není k dispozici.";
            return false;
        }
    }
}