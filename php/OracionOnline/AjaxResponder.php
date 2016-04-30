<?php
namespace OracionOnline;
use OracionOnline\Models\User;

class AjaxResponder
{
    private $session;
    public function __construct(Session $session)
    {
        $this->session = $session;
    }

    public function invoke(string $action, array $data) : string
    {
        if (!$this->session->isLoggedIn()) {
            return "false";
        }
        switch($action) {
            case "changeQueueState":

                $target = isset($data["targetState"]) ? $data["targetState"] : "false";

                $user = $this->session->getUser();

                $user->queued = ($target == "true" ? true : false);
                Doctrine::persistAndFlush($user);

                return "success";

            case "logout":
                $this->session->logout();
                return "success";
            case "getStatistics":
                /** @var User $user */
                $user = Doctrine::getEntityManager()->find(Doctrine::USER, $this->session->id);
                $dql = Doctrine::getEntityManager()->createQuery(
                    'SELECT COUNT(u.id) FROM \OracionOnline\Models\User u WHERE u.lastHeartbeat > :date');
                $dql->setParameters([
                    'date' => (new \DateTime())->sub(new \DateInterval("PT1M"))
                ]);
                $numOnline = $dql->getSingleScalarResult();
                return json_encode([
                   "gamesPlayed" => $user->gamesStarted,
                   "gamesWon" => $user->gamesWon,
                   "onlineCount" => $numOnline
                ]);
            case "heartbeat":
                $this->session->lastHeartbeat = new \DateTime();
                /** @var User $user */
                $user = Doctrine::getEntityManager()->find(Doctrine::USER, $this->session->id);
                $user->lastHeartbeat = new \DateTime();
                Doctrine::getEntityManager()->persist($user);
                Doctrine::getEntityManager()->flush($user);
                return json_encode([
                   "queued" => $user->queued
                ]);
        }
        return "false";
    }
}