<?php
namespace OracionOnline;
use OracionOnline\Models\Game;
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
            case "joinGame":
                return "false";
            case "cancelGameAsCreator":
                if (!isset($data["id"])) {
                    return json_encode(["success" => false, "reason" => "Data ID not set." ]);
                }
                $gameId = $data["id"];
                try {
                    Doctrine::getEntityManager()->transactional(function () use ($gameId) {
                        /**
                         * @var $game Game
                         */
                        $game = Doctrine::getEntityManager()->find(Doctrine::GAME, $gameId);
                        if ($game->firstPlayer->id == $this->session->getUser()->id) {
                            $game->status = Game::STATUS_TERMINATED;
                        } else {
                            throw new \Exception("You are not the creator.");
                        }
                    });
                    return json_encode(["success" => true]);
                } catch (\Exception $ex) {
                    return json_encode(["success" => false, "reason" => $ex->getMessage()]);
                }
            case "listGames":
                $gamesRepository = Doctrine::getEntityManager()->getRepository(Doctrine::GAME);
                /**
                 * @var $games Game[]
                 */
                $games = $gamesRepository->findAll();
                $targetArray = [];
                foreach($games as $game) {
                    $targetArray[] = [
                        "id" => $game->id,
                        "firstPlayer" => $game->firstPlayer->email,
                        "secondPlayer" => ($game->secondPlayer != null ? $game->secondPlayer->email : null),
                        "status" => $game->status
                    ];
                }
                return json_encode($targetArray);
            case "createGame":
                $game = new Game();
                $game->firstPlayer = $this->session->getUser();
                Doctrine::persistAndFlush($game);
                return json_encode(["id" => $game->id]);
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
                $user = $this->session->getUser();
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
                $user = $this->session->getUser();
                $user->lastHeartbeat = new \DateTime();
                Doctrine::getEntityManager()->persist($user);
                Doctrine::getEntityManager()->flush($user);
                return "success";
        }
        return "false";
    }
}