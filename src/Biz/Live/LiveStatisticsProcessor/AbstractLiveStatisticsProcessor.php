<?php

namespace Biz\Live\LiveStatisticsProcessor;

use Biz\User\Service\UserService;
use Codeages\Biz\Framework\Context\Biz;
use Codeages\Biz\Framework\Service\Exception\ServiceException;
use Topxia\Service\Common\ServiceKernel;

abstract class AbstractLiveStatisticsProcessor
{
    private $biz;

    const RESPONSE_CODE_SUCCESS = 0;

    const RESPONSE_CODE_NOT_FOUND = 4001;

    const RESPONSE_CODE_NOT_SUPPORT = 4003;

    public function __construct(Biz $biz)
    {
        $this->biz = $biz;
    }

    abstract public function handlerResult($result);

    protected function getLogService()
    {
        return ServiceKernel::instance()->createService('System:LogService');
    }

    protected function getUserIdByNickName($nickname)
    {
        $userId = trim(strrchr($nickname, '_'), '_');
        if (!is_numeric($userId) || empty($userId)) {
            return 0;
        }

        return $userId;
    }

    protected function checkResult($result)
    {
        if (!isset($result['code'])) {
            $this->getLogService()->info('course', 'live', 'check code error: '.json_encode($result));
            throw new ServiceException('code is not not found');
        }

        if (!in_array($result['code'], array(self::RESPONSE_CODE_NOT_SUPPORT, self::RESPONSE_CODE_SUCCESS, self::RESPONSE_CODE_NOT_FOUND))) {
            $this->getLogService()->info('course', 'live', 'check code error: '.json_encode($result));
            throw new ServiceException('code is not valid');
        }

        if (!isset($result['data'])) {
            $this->getLogService()->info('course', 'live', 'check data error: '.json_encode($result));
            throw new ServiceException('data is not found');
        }

        return true;
    }

    /**
     * @return UserService
     */
    protected function getUserService()
    {
        return ServiceKernel::instance()->createService('User:UserService');
    }
}
