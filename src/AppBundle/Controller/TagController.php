<?php
namespace AppBundle\Controller;

use Biz\Course\Service\CourseService;
use Biz\System\Service\SettingService;
use Biz\Taxonomy\Service\TagService;
use AppBundle\Common\Paginator;
use AppBundle\Common\ArrayToolkit;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class TagController extends BaseController
{
    /**
     * 获取所有标签，以JSONM的方式返回数据
     *
     * @return JSONM Response
     */
    public function allAction()
    {
        $data = array();

        $tags = $this->getTagService()->findAllTags(0, 100);
        foreach ($tags as $tag) {
            $data[] = array('id' => $tag['id'], 'name' => $tag['name']);
        }
        return $this->createJsonmResponse($data);
    }

    public function indexAction()
    {
        $tags = $this->getTagService()->findAllTags(0, 100);

        return $this->render('tag/index.html.twig', array(
            'tags' => $tags
        ));
    }

    public function showAction(Request $request, $name)
    {
        $courses = $paginator = null;

        $tag = $this->getTagService()->getTagByName($name);

        if ($tag) {
            $tagOwnerRelations = $this->getTagService()->findTagOwnerRelationsByTagIdsAndOwnerType(array($tag['id']), 'course');

            $courseIds = ArrayToolkit::column($tagOwnerRelations, 'ownerId');

            if (empty($courseIds)) {
                $courseIds = array(0);
            }

            $conditions = array(
                'status'    => 'published',
                'courseIds' => $courseIds,
                'parentId'  => 0
            );

            $paginator = new Paginator(
                $this->get('request'),
                $this->getCourseService()->searchCourseCount($conditions)
                , 12
            );

            $courses = $this->getCourseService()->searchCourses(
                $conditions,
                'latest',
                $paginator->getOffsetCount(),
                $paginator->getPerPageCount()
            );
        }
        return $this->render('tag/show.html.twig', array(
            'tag'       => $tag,
            'courses'   => $courses,
            'paginator' => $paginator
        ));
    }

    public function matchAction(Request $request)
    {
        $data        = array();
        $queryString = $request->query->get('q');
        $callback    = $request->query->get('callback');
        $tags        = $this->getTagService()->getTagByLikeName($queryString);
        foreach ($tags as $tag) {
            $data[] = array('id' => $tag['id'], 'name' => $tag['name']);
        }
        return new JsonResponse($data);
    }

    /**
     * @return TagService
     */
    protected function getTagService()
    {
        return $this->getBiz()->service('Taxonomy:TagService');
    }

    /**
     * @return CourseService
     */
    protected function getCourseService()
    {
        return $this->getBiz()->service('Course:CourseService');
    }

    /**
     * @return SettingService
     */
    protected function getSettingService()
    {
        return $this->getBiz()->service('System:SettingService');
    }
}
