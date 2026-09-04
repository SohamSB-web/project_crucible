const SUBMISSION_LIMIT = 800;

async function getSubmissionSettings(prisma) {
  let settings = await prisma.hackathonSetting.findUnique({ where: { id: 1 } });
  const submissionCount = await prisma.submission.count();

  if (submissionCount >= SUBMISSION_LIMIT && (!settings || settings.acceptingSubmissions)) {
    settings = await prisma.hackathonSetting.upsert({
      where: { id: 1 },
      create: { id: 1, acceptingSubmissions: false },
      update: { acceptingSubmissions: false },
    });
  }

  return {
    ...(settings || { id: 1, acceptingSubmissions: true }),
    acceptingSubmissions: submissionCount >= SUBMISSION_LIMIT ? false : (settings?.acceptingSubmissions ?? true),
    submissionCount,
    submissionLimit: SUBMISSION_LIMIT,
  };
}

module.exports = { SUBMISSION_LIMIT, getSubmissionSettings };