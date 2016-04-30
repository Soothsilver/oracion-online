<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

interface IView
{
    public function invoke(Session $session) : string;
}