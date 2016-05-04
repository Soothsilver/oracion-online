<?php
require_once 'vendor/autoload.php';
use OracionOnline\FrontController;
use OracionOnline\Session;

$session = Session::Construct();
sdagfdfsgdfgd
$controller = new FrontController($session);
$controller->invoke();

Session::saveChanges($session);
