<?php
use Doctrine\ORM\Tools\Console\ConsoleRunner;
use OracionOnline\Doctrine;

require_once 'vendor/autoload.php';
return ConsoleRunner::createHelperSet(Doctrine::getEntityManager());