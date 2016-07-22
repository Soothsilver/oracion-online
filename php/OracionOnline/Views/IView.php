<?php
namespace OracionOnline\Views;
use OracionOnline\Session;

/**
 * A view is a screen configuration of the application. There are four views - the login screen, the lobby screen, the waiting-for-second-player screen
 * and the primary ingame screen. Views are very simple components and only print their appropriate template HTML files while doing some
 * string substitutions.
 * @package OracionOnline\Views
 */
interface IView
{
    public function invoke(Session $session) : string;
}