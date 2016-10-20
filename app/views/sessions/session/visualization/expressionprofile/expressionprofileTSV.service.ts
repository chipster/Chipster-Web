
import {Injectable} from "@angular/core";
import GeneExpression from "./geneexpression";
import TSVRow from "./tsv/TSVRow";
import DomainBoundaries from "./domainboundaries";
import TSVHeaders from "./tsv/TSVHeaders";
import TSVFile from "./tsv/TSVFile";

@Injectable()
export default class ExpressionProfileTSVService {

    /*
     * Get chipvalues from raw data
     */
    public getGeneExpressions(tsv: TSVFile): Array<GeneExpression> {
        let chipIndexes = this.getChipValueIndexes(tsv);
        return _.map(tsv.body.rows, (row: TSVRow) => this.getGeneExpressionsByIndex(row, chipIndexes));
    }

    /*
     * max & min value from two-dimensional array
     */
    public getDomainBoundaries(tsv: TSVFile): DomainBoundaries {
        let chipIndexes = this.getChipValueIndexes(tsv);
        let values = _.map(tsv.body.rows, (row: TSVRow) => row.getCellsByIndexes(chipIndexes));
        let flatValues = _.map(_.flatten(values), (value: string) => this.stringToNumber(value));
        let min = _.min(flatValues);
        let max = _.max(flatValues);
        return new DomainBoundaries(min, max);
    }

    /*
     * Return array containing numbers indicating indexes for column headers starting with 'chip.'
     */
    public getChipHeaderIndexes(tsvHeaders: TSVHeaders): Array<number> {
        return _.chain(tsvHeaders.headers)
            .map( (cell: string, index: number) => _.startsWith(cell, 'chip.') ? index : false)
            .filter( (cell: number) => _.isNumber(cell))
            .value();
    }

    /*
     * Get Indexes containing actual .chip-values
     */
    public getChipValueIndexes(tsv: TSVFile ): Array<number> {
        let chipIndexes = this.getChipHeaderIndexes(tsv.headers);
        // if headers is missing a cell then add
        return tsv.isHeadersMissingCell ? _.map(chipIndexes, cellIndex => cellIndex + 1 ) : chipIndexes;
    }

    /*
     * create new GeneExpression from data with given id
     */
    public getGeneExpression(tsv: TSVFile, id: string): GeneExpression {
        let chipIndexes = this.getChipValueIndexes(tsv);
        let tsvRow = tsv.body.getTSVRow(id);

        return this.getGeneExpressionsByIndex(tsvRow, chipIndexes);
    }

    /*
     * Return a single GeneExpression based on id for the TSVRow and the values in indexes of row
     */
    getGeneExpressionsByIndex(row: TSVRow, indexes: Array<number>): GeneExpression {
        let values = row.getCellsByIndexes(indexes);
        let numberValues = _.map(values, (value: string) => this.stringToNumber(value));
        return new GeneExpression(row.id, numberValues);
    }

    /*
     * Order body by first chip-value in each row
     */
    public orderBodyByFirstValue(geneExpressions: Array<GeneExpression>): Array<GeneExpression> {
        return _.orderBy(geneExpressions, [ (geneExpression:GeneExpression) => _.first(geneExpression.values) ]);
    }

    /*
     * Parse number from a string
     */
    public stringToNumber(str: string): number {
        return parseFloat(str);
    }

    /*
     * Get chip-value headers
     */
    public getChipHeaders(tsv: TSVFile): Array<string> {
        let chipHeaderIndexes = this.getChipValueIndexes(tsv);
        return tsv.headers.getItemsByIndexes(chipHeaderIndexes);
    }

}