import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / '.github' / 'workflows' / 'calendar-pages.yml'


class DeployExcludesAdminToolsTests(unittest.TestCase):
    """admin-login.html hardcodes plaintext admin credentials, and
    admin-dashboard.html links directly to the Google Sheets that back the
    site's content. Neither has any real server-side protection, so they
    must never be copied into the published _site build. If this test
    starts failing, someone changed the deploy's "Prepare public files"
    step without preserving that exclusion - restore it before merging.
    """

    def test_workflow_removes_admin_pages_from_the_build(self):
        workflow_text = WORKFLOW.read_text()
        self.assertIn('rm -f _site/admin-login.html _site/admin-dashboard.html', workflow_text)


if __name__ == '__main__':
    unittest.main()
