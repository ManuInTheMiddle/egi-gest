
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface ApiResponse {
    "odata.metadata": string;
    "odata.etag": string;
    ItemCode: string;
    ItemName: string;
    ForeignName: string | null;
    ItemsGroupCode: number;
    CustomsGroupCode: number;
    SalesVATGroup: string;
    BarCode: string | null;
    VatLiable: string;
    PurchaseItem: string;
    SalesItem: string;
    InventoryItem: string;
    IncomeAccount: string | null;
    ExemptIncomeAccount: string | null;
    ExpanseAccount: string | null;
    Mainsupplier: string | null;
    SupplierCatalogNo: string | null;
    DesiredInventory: number;
    MinInventory: number;
    Picture: string | null;
    User_Text: string | null;
    SerialNum: string | null;
    CommissionPercent: number;
    CommissionSum: number;
    CommissionGroup: number;
    TreeType: string;
    AssetItem: string;
    DataExportCode: string | null;
    Manufacturer: number;
    QuantityOnStock: number;
    QuantityOrderedFromVendors: number;
    QuantityOrderedByCustomers: number;
    ManageSerialNumbers: string;
    ManageBatchNumbers: string;
    Valid: string;
    ValidFrom: string | null;
    ValidTo: string | null;
    ValidRemarks: string | null;
    Frozen: string;
    FrozenFrom: string | null;
    FrozenTo: string | null;
    FrozenRemarks: string | null;
    SalesUnit: string | null;
    SalesItemsPerUnit: number;
    SalesPackagingUnit: string | null;
    SalesQtyPerPackUnit: number;
    SalesUnitLength: number;
    SalesLengthUnit: string | null;
    SalesUnitWidth: number;
    SalesWidthUnit: string | null;
    SalesUnitHeight: number;
    SalesHeightUnit: string | null;
    SalesUnitVolume: number;
    SalesVolumeUnit: number;
    SalesUnitWeight: number;
    SalesWeightUnit: string | null;
    PurchaseUnit: string | null;
    PurchaseItemsPerUnit: number;
    PurchasePackagingUnit: string | null;
    PurchaseQtyPerPackUnit: number;
    PurchaseUnitLength: number;
    PurchaseLengthUnit: string | null;
    PurchaseUnitWidth: number;
    PurchaseWidthUnit: string | null;
    PurchaseUnitHeight: number;
    PurchaseHeightUnit: null,
    PurchaseUnitVolume: number,
    PurchaseVolumeUnit: number,
    PurchaseUnitWeight: number,
    PurchaseWeightUnit: null,
    PurchaseVATGroup: string,
    SalesFactor1: number,
    SalesFactor2: number,
    SalesFactor3: number,
    SalesFactor4: number,
    PurchaseFactor1: number,
    PurchaseFactor2: number,
    PurchaseFactor3: number,
    PurchaseFactor4: number,
    MovingAveragePrice: number,
    ForeignRevenuesAccount: null,
    ECRevenuesAccount: null,
    ForeignExpensesAccount: null,
    ECExpensesAccount: null,
    AvgStdPrice: number,
    DefaultWarehouse: string,
    ShipType: null,
    GLMethod: string,
    TaxType: string,
    MaxInventory: number,
    ManageStockByWarehouse: string,
    PurchaseHeightUnit1: null,
    PurchaseUnitHeight1: number,
    PurchaseLengthUnit1: null,
    PurchaseUnitLength1: number,
    PurchaseWeightUnit1: null,
    PurchaseUnitWeight1: number,
    PurchaseWidthUnit1: null,
    PurchaseUnitWidth1: number,
    SalesHeightUnit1: null,
    SalesUnitHeight1: number,
    SalesLengthUnit1: null,
    SalesUnitLength1: number,
    SalesWeightUnit1: null,
    SalesUnitWeight1: number,
    SalesWidthUnit1: null,
    SalesUnitWidth1: number,
    ForceSelectionOfSerialNumber: string,
    ManageSerialNumbersOnReleaseOnly: string,
    WTLiable: string,
    CostAccountingMethod: string,
    SWW: null,
    WarrantyTemplate: null,
    IndirectTax: string,
    ArTaxCode: null,
    ApTaxCode: null,
    BaseUnitName: null,
    ItemCountryOrg: null,
    IssueMethod: string,
    SRIAndBatchManageMethod: string,
    IsPhantom: string,
    InventoryUOM: null,
    PlanningSystem: string,
    ProcurementMethod: string,
    ComponentWarehouse: string,
    OrderIntervals: null,
    OrderMultiple: number,
    LeadTime: null,
    MinOrderQuantity: number,
    ItemType: string,
    ItemClass: string,
    OutgoingServiceCode: null,
    IncomingServiceCode: null,
    ServiceGroup: null,
    NCMCode: null,
    MaterialType: string,
    MaterialGroup: number,
    ProductSource: string,
    Properties1: string,
    Properties2: string,
    Properties3: string,
    Properties4: string,
    Properties5: string,
    Properties6: string,
    Properties7: string,
    Properties8: string,
    Properties9: string,
    Properties10: string,
    Properties11: string,
    Properties12: string,
    Properties13: string,
    Properties14: string,
    Properties15: string,
    Properties16: string,
    Properties17: string,
    Properties18: string,
    Properties19: string,
    Properties20: string,
    Properties21: string,
    Properties22: string,
    Properties23: string,
    Properties24: string,
    Properties25: string,
    Properties26: string,
    Properties27: string,
    Properties28: string,
    Properties29: string,
    Properties30: string,
    Properties31: string,
    Properties32: string,
    Properties33: string,
    Properties34: string,
    Properties35: string,
    Properties36: string,
    Properties37: string,
    Properties38: string,
    Properties39: string,
    Properties40: string,
    Properties41: string,
    Properties42: string,
    Properties43: string,
    Properties44: string,
    Properties45: string,
    Properties46: string,
    Properties47: string,
    Properties48: string,
    Properties49: string,
    Properties50: string,
    Properties51: string,
    Properties52: string,
    Properties53: string,
    Properties54: string,
    Properties55: string,
    Properties56: string,
    Properties57: string;
    Properties58: string,
    Properties59: string,
    Properties60: string,
    Properties61: string,
    Properties62: string,
    Properties63: string,
    Properties64: string,
    AutoCreateSerialNumbersOnRelease: string,
    DNFEntry: number,
    GTSItemSpec: null,
    GTSItemTaxCategory: null,
    FuelID: number,
    BeverageTableCode: null,
    BeverageGroupCode: null,
    BeverageCommercialBrandCode: number,
    Series: number,
    ToleranceDays: null,
    TypeOfAdvancedRules: string,
    IssuePrimarilyBy: string,
    NoDiscounts: string,
    AssetClass: null,
    AssetGroup: null,
    InventoryNumber: null,
    Technician: null,
    Employee: null,
    Location: null,
    AssetStatus: string,
    CapitalizationDate: null,
    StatisticalAsset: string,
    Cession: string,
    DeactivateAfterUsefulLife: string,
    ManageByQuantity: string,
    UoMGroupEntry: number,
    InventoryUoMEntry: number,
    DefaultSalesUoMEntry: null,
    DefaultPurchasingUoMEntry: null,
    DepreciationGroup: null,
    AssetSerialNumber: null,
    InventoryWeight: null,
    InventoryWeightUnit: null,
    InventoryWeight1: null,
    InventoryWeightUnit1: null,
    DefaultCountingUnit: null,
    CountingItemsPerUnit: number,
    DefaultCountingUoMEntry: null,
    Excisable: string,
    ChapterID: number,
    ScsCode: null,
    SpProdType: null,
    ProdStdCost: null,
    InCostRollup: string,
    VirtualAssetItem: string,
    EnforceAssetSerialNumbers: string,
    AttachmentEntry: null,
    LinkedResource: null,
    UpdateDate: string,
    UpdateTime: string,
    GSTRelevnt: string,
    SACEntry: number,
    GSTTaxCategory: string,
    ServiceCategoryEntry: number,
    CapitalGoodsOnHoldPercent: null,
    CapitalGoodsOnHoldLimit: null,
    AssessableValue: null,
    AssVal4WTR: null,
    SOIExcisable: string,
    TNVED: null,
    ImportedItem: string,
    PricingUnit: number,
    CreateDate: string,
    CreateTime: string,
    NVECode: null,
    CtrSealQty: null,
    CESTCode: number,
    LegalText: null,
    DataVersion: number,
    CreateQRCodeFrom: null,
    TraceableItem: string,
    CommodityClassification: null,
    U_BA_IsFA: string,
    U_BA_TypID: number,
    U_BA_NumID: null,
    U_BA_LVA: number,
    U_BNComCod: null|string,
    U_BNSupUnt: null| string,
    U_BNSupFct: null|string,
    U_BNOriCtr: null|string,
    U_BNOriSta: null|string,
    U_BNTAType: null|string,
    U_BNCstPrc: null|string,
    U_Prd_TmpMinMist: null|string,
    U_Prd_phEsp: null|string,
    U_Prd_DensEsp: null|string,
    U_Prd_ViscEsp: null|string,
    U_Prd_ExtSecoEsp: null|string,
    U_BA_LVAFrom: number,
    U_EBR_SAFT_TYPE: null|string,
    U_Ph_Min: null|string,
    U_Ph_Max: null|string,
    U_Den_Min: null|string,
    U_Den_Max: null|string,
    U_Res_Min: null|string,
    U_Res_Max: null|string,
    U_Visc_Spi: null|string,
    U_Visc_Rot: null|string,
    U_Visc_Min: null|string,
    U_Visc_Max: null|string,
    U_Anio_PM: null|string,
    U_Anio_Min: null|string,
    U_Anio_Max: null|string,
    U_Cat_PM: null|string,
    U_Cat_Min: null|string,
    U_Cat_Max: null|string,
    U_AnSab_PM: null|string,
    U_AnSab_Min: null|string,
    U_AnSab_Max: null|string,
    U_Alc_Hidro: null|string,
    U_Alc_Min: null|string,
    U_Alc_Max: null|string,
    U_Aci: null|string,
    U_Aci_Min: null|string,
    U_Aci_Max: null|string,
    U_Amo_Min: null|string,
    U_Amo_Max: null|string,
    U_Clo_Min: null|string,
    U_Clo_Max: null|string,
    U_Pero_Min: null|string,
    U_Pero_Max: null|string,
    U_TuCo_Min: null|string,
    U_TuCo_Max: null|string,
    ItemPrices: any[],
    ItemWarehouseInfoCollection: any[],
    ItemPreferredVendors: any[],
    ItemLocalizationInfos: any[],
    ItemProjects: any[],
    ItemDistributionRules: any[],
    ItemAttributeGroups: any[],
    ItemDepreciationParameters: any[],
    ItemPeriodControls: any[],
    ItemUnitOfMeasurementCollection: any[],
    ItemBarCodeCollection: any[],
    ItemIntrastatExtension: {
        ItemCode: string,
        CommodityCode: null,
        SupplementaryUnit: null,
        FactorOfSupplementaryUnit: number,
        ImportRegionState: null,
        ExportRegionState: null,
        ImportNatureOfTransaction: null,
        ExportNatureOfTransaction: null,
        ImportStatisticalProcedure: null,
        ExportStatisticalProcedure: null,
        CountryOfOrigin: null,
        ServiceCode: null,
        Type: string,
        ServiceSupplyMethod: string,
        ServicePaymentMethod: string,
        ImportRegionCountry: string,
        ExportRegionCountry: string,
        UseWeightInCalculation: string,
        IntrastatRelevant: string,
        StatisticalCode: null
    }
}

const receitaDefault = "214d"

export const useFetchRecipeInformationData = (receita:string=receitaDefault
  ) => {
    return useQuery({
      queryKey: ["informacaoReceita"],
      queryFn: async () => {
        const { data } = await axios.get(
          `http://egiquim-sap:50001/b1s/v1/Items('${receita}')`,
          { withCredentials: true }
        );
        return data as ApiResponse;
      },
      enabled:false
    });
  };