<?php

namespace Biz\Live\LiveStatisticsProcessor;

use Codeages\Biz\Framework\Service\Exception\ServiceException;

class CheckinProcessor extends AbstractLiveStatisticsProcessor
{
    public function handlerResult($result)
    {
        try {
            $this->checkResult($result);

            $data = $this->handleData($result['data']);

            return $data;
        } catch (ServiceException $e) {
            throw $e;
        }
    }

    private function handleData($data)
    {
        if (empty($data)) {
            return array();
        }

        try {
            $users = $data[0]['users'];
            foreach ($users as &$user) {
                $user = $this->handleUser($user);
            }
        } catch (ServiceException $e) {
            $this->getLogService()->info('course', 'live', 'handle checkin data error: ', json_encode($data));

            return array(
                'time' => 0,
                'success' => 0,
                'detail' => array(),
            );
        }

        return array(
            'time' => $data[0]['time'] / 1000,
            'success' => 1,
            'detail' => $users,
        );
    }

    private function handleUser($user)
    {
        $userId = $this->getUserIdByNickName($user['nickName']);
        if (empty($userId)) {
            throw new ServiceException('user not found');
        }

        $existUser = $this->getUserService()->getUser($userId);
        $user['nickname'] = empty($existUser['nickname']) ? $user['nickName'] : $existUser['nickname'];

        $user['userId'] = $userId;

        return $user;
    }
}
