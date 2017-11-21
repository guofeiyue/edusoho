<?php

namespace Biz\User\Register\Impl;

use Codeages\Biz\Framework\Service\Exception\InvalidArgumentException;
use AppBundle\Common\SimpleValidator;

class MobileRegistDecoderImpl extends RegistDecoder
{
    protected function validateBeforeSave($registration)
    {
        if (!empty($registration['mobile']) && !SimpleValidator::mobile($registration['mobile'])) {
            throw new InvalidArgumentException('Invalid Mobile');
        }

        if (!$this->getUserService()->isMobileAvaliable($registration['mobile'])) {
            throw new InvalidArgumentException('Mobile Occupied');
        }
    }
}