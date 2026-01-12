import { PrismaClient } from '@prisma/client';

export async function seedScenarios(prisma: PrismaClient) {
  console.log('Seeding scenarios...');

  const org = await prisma.organization.findUnique({
    where: { slug: 'default' },
  });

  if (!org) {
    throw new Error('Default organization not found. Please run the main seeder first.');
  }

  const creator = await prisma.person.findFirst({
    where: {
      account: {
        email: 'officebearers@gmail.com',
      },
    },
  });

  if (!creator) {
    throw new Error('Creator (officebearers@gmail.com) not found. Please run the main seeder first.');
  }

  const scenario = await prisma.scenario.upsert({
    where: { id: 1 },
    update: {
      title: 'Cardiovascular Emergency Management',
      description: 'A comprehensive test on managing cardiovascular emergencies in clinical settings.',
    },
    create: {
      id: 1,
      title: 'Cardiovascular Emergency Management',
      description: 'A comprehensive test on managing cardiovascular emergencies in clinical settings.',
      creator_id: creator.id,
      org_id: org.id,
    },
  });

  // Clear existing questions for this scenario to avoid duplicates on re-seed
  await prisma.scenarioQuestion.deleteMany({
    where: { scenario_id: scenario.id },
  });

  const questions = [
    {
      statement: 'What is the FIRST action when a patient presents with sudden chest pain and shortness of breath?',
      options: [
        { label: 'Administer Aspirin', is_correct: false },
        { label: 'Perform a 12-lead ECG', is_correct: true },
        { label: 'Give Sublingual Nitroglycerin', is_correct: false },
        { label: 'Check Vitals and Airway', is_correct: false },
      ],
    },
    {
      statement: 'Which ECG finding is MOST indicative of an acute ST-elevation myocardial infarction (STEMI)?',
      options: [
        { label: 'ST-segment depression in V1-V3', is_correct: false },
        { label: 'T-wave inversion in Lead II', is_correct: false },
        { label: 'ST-segment elevation ≥ 1mm in two contiguous leads', is_correct: true },
        { label: 'Prominent U waves', is_correct: false },
      ],
    },
    {
      statement: 'A patient in Ventricular Fibrillation (VF) has received one shock. What is the NEXT immediate step?',
      options: [
        { label: 'Check for a pulse', is_correct: false },
        { label: 'Resume high-quality CPR', is_correct: true },
        { label: 'Administer Epinephrine 1mg', is_correct: false },
        { label: 'Deliver a second shock', is_correct: false },
      ],
    },
    {
      statement: 'What is the recommended dose of Aspirin for a patient with suspected Acute Coronary Syndrome (ACS)?',
      options: [
        { label: '81 mg', is_correct: false },
        { label: '162 mg to 325 mg (non-enteric coated)', is_correct: true },
        { label: '500 mg', is_correct: false },
        { label: '1000 mg', is_correct: false },
      ],
    },
    {
      statement: 'Which drug is FIRST-LINE for symptomatic bradycardia unresponsive to initial measures?',
      options: [
        { label: 'Epinephrine', is_correct: false },
        { label: 'Amiodarone', is_correct: false },
        { label: 'Atropine 1mg', is_correct: true },
        { label: 'Lidocaine', is_correct: false },
      ],
    },
    {
      statement: 'Beck’s triad (muffled heart sounds, JVD, and hypotension) is diagnostic for which condition?',
      options: [
        { label: 'Tension Pneumothorax', is_correct: false },
        { label: 'Cardiac Tamponade', is_correct: true },
        { label: 'Pulmonary Embolism', is_correct: false },
        { label: 'Massive Myocardial Infarction', is_correct: false },
      ],
    },
    {
      statement: 'In Adult BLS, what is the correct compression-to-ventilation ratio for a single rescuer?',
      options: [
        { label: '15:2', is_correct: false },
        { label: '30:2', is_correct: true },
        { label: '10:1', is_correct: false },
        { label: '5:1', is_correct: false },
      ],
    },
    {
      statement: 'What is the targeted PETCO2 (Capnography) value indicating high-quality CPR?',
      options: [
        { label: 'Above 5 mmHg', is_correct: false },
        { label: 'Above 10 mmHg', is_correct: true },
        { label: 'Exactly 20 mmHg', is_correct: false },
        { label: 'Below 10 mmHg', is_correct: false },
      ],
    },
    {
      statement: 'Which of the following is a REVERSIBLE cause of cardiac arrest (Hs and Ts)?',
      options: [
        { label: 'Hypertrophic Cardiomyopathy', is_correct: false },
        { label: 'Hypovolemia', is_correct: true },
        { label: 'Hypertension', is_correct: false },
        { label: 'Hyperthyroidism', is_correct: false },
      ],
    },
    {
      statement: 'The "Golden Hour" in ST-elevation MI emphasizes reperfusion therapy within how many minutes of medical contact?',
      options: [
        { label: '30 minutes', is_correct: false },
        { label: '60 minutes', is_correct: false },
        { label: '90 minutes', is_correct: true },
        { label: '120 minutes', is_correct: false },
      ],
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.scenarioQuestion.create({
      data: {
        scenario_id: scenario.id,
        statement: q.statement,
        type: 'CHOICE',
        order: i,
        options: {
          create: q.options,
        },
      },
    });
  }

  console.log('Seeded 10 questions for scenario:', scenario.title);
}
