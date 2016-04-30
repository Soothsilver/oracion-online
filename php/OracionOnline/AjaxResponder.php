<?php
namespace OracionOnline;
class AjaxResponder
{
    private $session;
    public function __construct($session)
    {
        $this->session = $session;
    }

    public function invoke(string $action) : string
    {
        switch($action) {
            case "login":
                $googleToken = isset($_POST["idtoken"]) ? $_POST["idtoken"] : false;
                if (!$googleToken) {
                    return "FAIL";
                }
        }
        return "FAIL";
    }
}