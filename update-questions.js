const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./grc.db', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to grc.db');
    ensureTableExists();
});

function ensureTableExists() {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        name TEXT,
        question TEXT,
        weight INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Table creation failed:', err);
            process.exit(1);
        }
        console.log('✅ Questions table ready');
        addRBIGRCQuestions();
    });
}

// 🔥 RBI IT GRC + CLIX CAPITAL QUESTIONS (60+ Controls)
function addRBIGRCQuestions() {
    console.log('🚀 Adding RBI IT GRC Questions...');
    
    const rbiQuestions = [
        // CONTROL 1: IT GOVERNANCE
        ['RBI-01', 'SOD Matrix', 'Do you have SOD Matrix for the Application?', 4],
        ['RBI-02', 'ISO/SOC2 Cert', 'Does your organization currently holds an ISO 27001 or SOC 2 Certification? If yes, Could you provide any relevant details regarding your compliance status with these standards?', 5],
        ['RBI-03', 'Process Changes', 'Are there any updates or changes to the processes related to the services provided to Clix Capital? If so, could you please provide details on these changes?', 3],
        ['RBI-04', 'Outsourced Security', 'Are the Information security tasks outsourced/Sub-Contracted? If yes, is the accountability maintained within the organization?', 4],
        ['RBI-05', 'Independent Audit', 'Can you provide details or documentation regarding any independent audit conducted on your IT controls?', 4],

        // CONTROL 2: LOGICAL ACCESS CONTROL (15 Questions)
        ['RBI-06', 'Access Policy', 'Do you have a documented Logical access control policy or procedure document based on business and information security needs?', 4],
        ['RBI-07', 'Access Grant/Revoke', 'What is the process for granting and revoking logical access to the users? Is there any documented process in place?', 3],
        ['RBI-08', 'Unique User ID', 'Do you create unique ID as a user Id for each users?', 3],
        ['RBI-09', 'Leaver Access', 'Do you disable, or remove user ID\'s who have left the organization? How soon this is action?', 4],
        ['RBI-10', 'Redundant IDs', 'Do you disable or remove redundant user ID\'s? What is the mechanism to identify such ID\'s?', 3],
        ['RBI-11', 'Role Change Access', 'Do you change or disable access rights based on users change in role or remove access rights in case the user has left the organization? How soon this is actioned?', 4],
        ['RBI-12', 'Access Tracking', 'Do you maintain the track of logical access provided and removed?', 3],
        ['RBI-13', 'Temporary IDs', 'Do you create temporary Id\'s? Are they disabled or removed after its usage?', 3],
        ['RBI-14', 'Subcontractor Access', 'Is Access Given to any of your sub contractor?', 3],
        ['RBI-15', 'Periodic Access Review', 'Do you periodically review access rights with owners of the Information assets?', 4],
        ['RBI-16', 'Privileged ID', 'Do you give a separate privileged ID for a exisiting local user, which is separate from normal operational user ID?', 4],
        ['RBI-17', 'Privileged Expiry', 'Is there an expiry period of privileged access rights maintained?', 4],
        ['RBI-18', 'Admin Rights Review', 'Do you regularly review administrative rights over the business critical system? What is the frequency?', 4],
        ['RBI-19', 'First Login Password', 'Are user prompted to change the password at first login?', 2],
        ['RBI-20', 'Password Management System', 'Do you have a password management system, which can enforce users to change default password, maintain quality password, regularly enforce password change? E.g.: Windows AD, LDAP etc.', 4],

        // CONTROL 3: PASSWORD MANAGEMENT (9 Questions)
        ['RBI-21', 'Password Policy', 'Do you have Password Management Policy?', 4],
        ['RBI-22', 'Password Change Frequency', 'How frequently are the user forced to change their passwords? Is it system enforced?', 3],
        ['RBI-23', 'First Login Prompt', 'Are users prompted to change their passwords at first login? Is it system enforced?', 3],
        ['RBI-24', 'Password Communication', 'How are passwords communicated to the user, during joining formalities and upon reset?', 2],
        ['RBI-25', 'Password Reset Process', 'How does the password reset process work?', 3],
        ['RBI-26', 'Password Complexity', 'Is your password construction consists of complexity in terms of: 1. Alphanumeric, special characters. 2. minimum password length. 3. not based on personal identity to be easily guessed. 4. not using atleast 5 repeated used passwords.', 5],
        ['RBI-27', 'Unencrypted Passwords', 'Do passwords travel over the network in unencrypted form (ftp, telnet, E-mail and applications etc.)?', 4],
        ['RBI-28', 'MFA Enabled', 'Is multi-factor authentication enabled for accessing the application and realted infra?', 5],

        // CONTROL 4: VULNERABILITY & PATCH (5 Questions)
        ['RBI-29', 'Vulnerability Procedure', 'Do you have a documented procedure for the Vulnerability Assessment & Patch Management practice in your organization?', 4],
        ['RBI-30', 'Vulnerability Monitoring', 'How is the vulnerabilities and exploits monitored? Is it done through your internal SOC (Security Operation Control) or through an Managed Security Service Provider (MSSP)?', 4],
        ['RBI-31', 'Patch Frequency', 'What is the frequency of Security Patches & How are the Patches deployed?', 3],
        ['RBI-32', 'Patch Testing', 'Do you have a test environment, where the patches are applied and test, before it is deployed on the production environment?', 3],
        ['RBI-33', 'Patch Monitoring', 'Do you have central monitoring tool which gives you details about the pending populations, which are yet to be patched?', 3],

        // CONTROL 5: CHANGE MANAGEMENT (12 Questions)
        ['RBI-34', 'Change Management Practice', 'Do you have a documented Change Management Practice?', 4],
        ['RBI-35', 'Change Recording', 'Is there a practice of recording changes in your IT environment?', 3],
        ['RBI-36', 'Change Approval', 'Are changes to the systems documented and approved by the concerned department / personnel?', 4],
        ['RBI-37', 'Change Documentation', 'Does the document capture the significant change details?', 3],
        ['RBI-38', 'Change Testing', 'Are tests conducted before implementing the changes?', 4],
        ['RBI-39', 'Change Communication', 'Are the changes communicated to all the concerned staff?', 2],
        ['RBI-40', 'Fallback Procedures', 'Are fall-back procedures, including procedures and responsibilities for aborting and recovering from unsuccessful changes and unforeseen events mentioned?', 4],
        ['RBI-41', 'Emergency Changes', 'Are all emergency changes recorded? Who reviews & approves such change requests?', 4],
        ['RBI-42', 'Emergency Change Criteria', 'Under what circumstances are the decision for an emergency changes initiated in an IT environment?', 3],
        ['RBI-43', 'Production Change Testing', 'Do you properly test the changes before it being applied to production server?', 4],
        ['RBI-44', 'Change Approval Board', 'Do you have Change Approval Boards (CAB) or approving authorities to approve the normal & emergency changes?', 4],
        ['RBI-45', 'Change Closure', 'How are the change requests closed? Share last change requests?', 3],

        // CONTROL 6: DATA MIGRATION (4 Questions)
        ['RBI-46', 'Data Migration Plan', 'Has a comprehensive data migration plan been developed and documented, including timelines, responsibilities, and risk assessments?', 4],
        ['RBI-47', 'Data Validation', 'What procedures are in place to validate data accuracy and completeness before and after migration to ensure data integrity?', 4],
        ['RBI-48', 'Migration Testing', 'Have thorough testing protocols, including unit, integration, and user acceptance testing (UAT), been established to validate the migration process?', 4],
        ['RBI-49', 'Data Privacy Migration', 'What measures are in place to ensure that data privacy and security are maintained throughout the migration process, particularly in compliance with relevant regulations and standards?', 5],

        // CONTROL 7: AUDIT TRAIL (6 Questions)
        ['RBI-50', 'Audit Trail Control', 'Have you implemented Audit Trail control in your process? If yes, What was the effective date you initiated the control?', 4],
        ['RBI-51', 'Audit Trail Content', 'Do you ensure that the audit trail captures changes to the database which include the following: when changes were made, who made those changes, what data was changed?', 5],
        ['RBI-52', 'Audit Retention', 'What is the defined time period for retention period of the database audit trail logs?', 3],
        ['RBI-53', 'Audit Always Enabled', 'Whether Audit trail feature is always enabled (not disabled) throughout the year?', 4],
        ['RBI-54', 'Audit Protection', 'How do you ensure that the audit trail is appropriately protected from any modification?', 5],
        ['RBI-55', 'Audit Backup', 'How the audit trail is retained as per statutory requirements for record retention? Is there any backup data for the same?', 4],

        // CONTROL 8: CHAIN OF CUSTODY (5 Questions)
        ['RBI-56', 'Chain of Custody SOP', 'Do you have SOP to maintain Chain of Custody, and who has access to this documentation? Are there clear records indicating who has accessed or modified the audit trail at each stage?', 4],
        ['RBI-57', 'Authorized Access', 'What measures are in place to ensure that only authorized personnel can access and handle audit trail data?', 4],
        ['RBI-58', 'Audit Transfer Security', 'What controls are implemented to ensure the integrity and security of the audit trails during transfer and storage?', 4],
        ['RBI-59', 'Audit Monitoring', 'Is the audit trail data appropriately protected, used, handled and monitored?', 4],
        ['RBI-60', 'Breach Response', 'In the event of a suspected breach or irregularity in the audit trail chain of custody, what procedures are in place for investigation and incident response?', 5]
    ];

    // Insert all questions (only if they don't exist)
    db.serialize(() => {
        const stmt = db.prepare("INSERT OR IGNORE INTO questions (id, name, question, weight) VALUES (?, ?, ?, ?)");
        
        let insertedCount = 0;
        rbiQuestions.forEach((q, index) => {
            stmt.run(q, () => {
                insertedCount++;
                if (index === rbiQuestions.length - 1) {
                    console.log(`✅ Successfully processed ${insertedCount} RBI IT GRC Questions!`);
                    checkTotalQuestions();
                }
            });
        });
        
        stmt.finalize(() => {
            console.log('🎉 RBI IT GRC Database Update Complete!');
            db.close(() => {
                console.log('🔒 Database connection closed');
                process.exit(0);
            });
        });
    });
}

function checkTotalQuestions() {
    db.all("SELECT COUNT(*) as total FROM questions", [], (err, rows) => {
        if (err) {
            console.error('❌ Query failed:', err);
            return;
        }
        console.log(`📊 Total Questions in grc.db: ${rows[0].total}`);
        
        // Show sample questions
        db.all("SELECT id, name FROM questions ORDER BY id LIMIT 5", (err, sample) => {
            console.log('📋 Sample Questions:');
            sample.forEach(q => console.log(`   ${q.id}: ${q.name}`));
            console.log('');
        });
    });
}
