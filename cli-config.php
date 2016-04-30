<?php
use Doctrine\ORM\Tools\Console\ConsoleRunner;
use OracionOnline\Doctrine;

require_once 'vendor/autoload.php';
Doctrine::Bootstrap();
return ConsoleRunner::createHelperSet(Doctrine::$entityManager);