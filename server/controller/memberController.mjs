import MemberHelper from "../helper/memberHelper.mjs";
import Member from "../model/member.mjs";
import CreateResponse from "../model/CreateResponse.mjs";
import ApiError from "../model/ApiError.mjs";
import fs from "fs";
import {exportMemberList} from "../services/ExportService.mjs";
import EncryptionService from "../services/EncryptionService.mjs";
import {
    checkIfUniqueEmail,
    checkIfUniqueTelephone
} from "../services/UniqueChecker.mjs";



const handleGetAllMembers = async (req, res) => {
    const memberHelper = new MemberHelper();
    const encryptionService = new EncryptionService();

    try {
        const members = await memberHelper.getAllMembers();
        //console.log(members)
        const decryptedMembersList = encryptionService.decryptMembersListData(members);
        res.status(200).json(decryptedMembersList);
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}

const handleNewMember = async (req, res) => {
    const memberHelper = new MemberHelper();

    const member = new Member(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.telephone,
        req.body.active,
        req.body.role_id,
        req.body.entry_date
    );
    try {
        console.log(req.body.email)
        console.log(req.body.telephone)
        let isUniqueEmail = await checkIfUniqueEmail(req.body.email);
        let isUniqueTelephone = await checkIfUniqueTelephone(req.body.telephone);
        console.log("Unique email:",isUniqueEmail)
        console.log("Unique telephone", isUniqueTelephone)
        if (isUniqueEmail && isUniqueTelephone){
            const result = await memberHelper.addMember(member);
            if (result.success && result.data.affectedRows === 1)
                return res.status(201).json(new CreateResponse("mere-201"));
        }else {
            return res.status(400).json(new ApiError("me-400"));
        }

    } catch (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json(new ApiError("me-400"))
        return res.status(500).json(new ApiError("ee-999"));
    }
}

const handleUpdateMember = async (req, res) => {
    const memberId = req.params.id;

    const memberHelper = new MemberHelper();
    const member = new Member(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.telephone,
        req.body.active,
        req.body.role_id,
        req.body.entry_date
    );
    try {
        let isUniqueEmail = await checkIfUniqueEmail(req.body.email);
        let isUniqueTelephone = await checkIfUniqueTelephone(req.body.telephone);
        if (isUniqueEmail && isUniqueTelephone){
            const result = await memberHelper.updateMember(memberId, member);
            console.log(result)
            if (result.data.affectedRows === 0) return res.status(404).json(new ApiError("me-404"));
            return res.status(200).json(new CreateResponse("mere-200"));
        }else {
            return res.status(400).json(new ApiError("me-400"));
        }
    } catch (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json(new ApiError("me-400"))
        return res.status(500).json(new ApiError("ee-999"));
    }
}
const handleGetMemberById = async (req, res) => {
    const memberHelper = new MemberHelper();
    const encryptionService = new EncryptionService();
    try {
        const member = await memberHelper.getMemberById(req.params.id);
        console.log(member.data)
        let decryptedMember = encryptionService.decryptMemberdata(member)
        console.log(decryptedMember)

        if (member.data.length === 0) {
            return res.status(404).json( new ApiError("me-404"));
        } else {
            return res.status(200).json(decryptedMember);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}
const handleGetAllMemberInfo = async (req, res) => {
    const memberHelper = new MemberHelper();
    const encryptionService = new EncryptionService();
    try {
        const member = await memberHelper.getMemberByIdWithRole(req.params.id);
        if (member.data.length === 0) {
            return res.status(404).json( new ApiError("me-404"));
        } else {
            let decryptedMember = encryptionService.decryptMemberdata(member)
            return res.status(200).json(decryptedMember);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}

const handleDeleteMember = async (req, res) => {
    const memberHelper = new MemberHelper();
    try {
        const result = await memberHelper.deleteMemberById(req.params.id);
        if (result.success && result.data.affectedRows === 1) {
            return res.status(200).json(new CreateResponse("mere-202"));
        }
        return res.status(404).json(new ApiError("me-404"));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}
const handleGetAllRoles = async (req, res) => {
    const memberHelper = new MemberHelper();
    try {
        const roles = await memberHelper.getAllMemberRoles();
        res.status(200).json(roles);
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}
const handleGetAllPayments = async (req, res) => {
    const memberHelper = new MemberHelper();
    const encryptionService = new EncryptionService();
    try {
        const payments = await memberHelper.getMemberPaymentsForPeriod();
        let decryptedPayments = encryptionService.decryptPaymentData(payments)
        res.status(200).json(decryptedPayments);
    }catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}
const handleGetPaymentById = async (req, res) => {
    const memberHelper = new MemberHelper();
    try {
        const payment = await memberHelper.getMemberPaymentById(req.params.id);
        if (payment.data.length === 0) {
            return res.status(404).json( new ApiError("pe-404"));
        }
        return res.status(200).json(payment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}
const handleUpdatePayment = async (req, res) => {
    const paymentId = req.params.id;
    const memberHelper = new MemberHelper();
    let paidStatus = req.body.paid
    console.log(paidStatus)
    console.log(paymentId)

    try {
        const result = await memberHelper.updateMemberPayment(paymentId, paidStatus);
        console.log(result)
        if (result.data.affectedRows === 0) return res.status(404).json(new ApiError("pe-404"));
        return res.status(200).json(new CreateResponse("pere-200"));

    }catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError("ee-999"));
    }
}
const handleCreateNewPaymentPeriod = async (req, res) => {
    const memberHelper = new MemberHelper();
    try {
        const result = await memberHelper.addMemberPaymentPeriod();
        console.log(result)
        res.status(201).json(new CreateResponse("pere-201"));
    }catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError("ee-999"));
    }
}
const handleMemberListExportFile = async (req, res) => {
    try {
        // The folder path for the files
        let downloaded = await exportMemberList();
        // dynamischer folder path erstellen
        const folderPath = '../server/temp';
        if (fs.existsSync(folderPath + '/memberList.csv') && downloaded) {
            res.download(folderPath + '/memberList.csv', function (err) {
                if (err) {
                    console.log(err);
                }
                fs.unlink(folderPath + '/memberList.csv', function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("File deleted");
                    }
                })
            })
        } else {
            console.log("File not found")
            res.status(404).json(new ApiError("fe-404"));
        }

    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError("ee-999"));
    }
}


export default {
    handleGetAllMembers,
    handleNewMember,
    handleUpdateMember,
    handleGetMemberById,
    handleDeleteMember,
    handleGetAllMemberInfo,
    handleGetAllRoles,
    handleMemberListExportFile,
    handleGetAllPayments,
    handleGetPaymentById,
    handleUpdatePayment,
    handleCreateNewPaymentPeriod

}