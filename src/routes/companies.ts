import { Company } from "../models/Company";
import { Router, Request, Response } from "express";
import { body, param, matchedData } from "express-validator";
import { checkValidation } from "../middlewares/validations";

// connect router to main app
const router = Router();

// get all companies
router.get(
    "/", 
    async (req: Request, res: Response) => {
        const company = await Company.find();
        res.send(company);
});

// get company by id
router.get(
    "/:id",
    param("id").isMongoId(),
    checkValidation,
    async (req: Request, res: Response) => {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });
        res.json(company);
});

// delete company by id
router.delete(
    "/:id",
    param("id").isMongoId(),
    checkValidation,
    async (req: Request, res: Response) => {
        await Company.findByIdAndDelete(req.params.id);
        const company = await Company.findById(req.params.id);
        if (company) return res.status(404).json({ message: "Company not found" });
        res.json({ message: "Company deleted" });
});

// update company
router.patch(
    "/:id", 
    body("name").trim().notEmpty().optional(),
    body("established").isInt({ gt: 0 }).optional(),
    body("email").trim().notEmpty().isEmail().optional(),
    body("address").trim().notEmpty().optional(),
    body("phone").trim().notEmpty().isMobilePhone('any').optional(),
    body("website").trim().notEmpty().isURL().optional(),
    body("description").trim().notEmpty().optional(),
    param("id").isMongoId(),
    checkValidation,
    async (req: Request, res: Response) => {
        await Company.findByIdAndUpdate(req.params.id, matchedData(req));
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found" });
        res.json({ message: "Company updated" });
});

// create company
router.post(
    "/",
    body("name").trim().notEmpty(),
    body("established").isInt({ gt: 0 }),
    body("email").trim().notEmpty().isEmail().optional(),
    body("address").trim().notEmpty().optional(),
    body("phone").trim().notEmpty().isMobilePhone('any').optional(),
    body("website").trim().notEmpty().isURL().optional(),
    body("description").trim().notEmpty().optional(),
    checkValidation,
    async (req: Request, res: Response) => {
        try {
            const company = new Company(matchedData(req));
            if (await Company.findOne({ name: company.name })) return res.status(409).json({ message: "Company already exists" });
            const savedCompany = await company.save();
            res.json(savedCompany);
        } catch (e) {
            res.status(409).json({ message: e });
        }
});

// export router
export default router;